import { useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { selectAuthIsValid, selectAuthIsInit, selectAuthIsComplete, setAccessToken, selectAccessToken } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN } from '../../constants';

const INIT_USER = gql`
  mutation InitUser($palette: String!) {
    initUser(palette: $palette) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;

const GET_CURRENT_USER = gql`
  mutation GetCurrentUser($accessToken: String!) {
    getCurrentUser(accessToken: $accessToken) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useAuth(palette: 'dark' | 'light') {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);

  const isInit = useAppSelector(selectAuthIsInit);
  const isValid = useAppSelector(selectAuthIsValid);
  const isComplete = useAppSelector(selectAuthIsComplete);

  const [isLoading, setIsLoading] = useState(false);

  const { refreshToken, refreshTokenInterval } = useToken();

  const [getUser] = useMutation(GET_CURRENT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      if (!isLoading) return;
      setIsLoading(false);

      console.log(data);
      if (!data.getCurrentUser.id) return;

      refreshTokenInterval();

      dispatch(setCurrentUser(data.getCurrentUser));
    }
  });

  const [initUser] = useMutation(INIT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: async data => {
      console.log(data);

      dispatch(setAccessToken(data.initUser.accessToken));

      await Preferences.set({ key: REFRESH_TOKEN, value: data.initUser.refreshToken });

      setIsLoading(false);

      refreshTokenInterval();

      dispatch(setCurrentUser(data.initUser.user));
    }
  });

  useEffect(() => {
    refreshToken();
  }, [])

  useEffect(() => {
    if (!isInit) return;
    if (isComplete) return;
    
    if (isValid) {
      setIsLoading(true);
      getUser({
        variables: {
          accessToken,
        },
      });
    }
    else {
      setIsLoading(true)
      initUser({
        variables: {
          palette,
        }
      });
    }
  }, [isInit, isValid]);
}
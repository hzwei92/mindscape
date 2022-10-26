import { useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { selectAuthIsValid, selectAuthIsInit, selectAuthIsComplete } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN } from '../../constants';

const INIT_USER = gql`
  mutation InitUser($palette: String!) {
    initUser(palette: $palette) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

const GET_CURRENT_USER = gql`
  mutation GetCurrentUser {
    getCurrentUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useAuth(palette: 'dark' | 'light') {
  const dispatch = useAppDispatch();

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

      const cookies = document.cookie.split('; ');
      console.log('cookies', cookies);
      let refreshCookie;
      cookies.some(cookie => {
        refreshCookie = cookie.match(/^Refresh=.*$/);
        return !!refreshCookie;
      });
      if (refreshCookie && refreshCookie[0]) {
        console.log(refreshCookie[0]);

        await Preferences.set({
          key: REFRESH_TOKEN,
          value: refreshCookie[0],
        });
      }

      setIsLoading(false);

      refreshTokenInterval();

      dispatch(setCurrentUser(data.initUser));
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
      getUser();
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
import { useContext, useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { selectAuthIsValid, selectAuthIsInit } from './authSlice';

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
    onCompleted: data => {
      console.log(data);
      
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
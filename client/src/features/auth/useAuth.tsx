import { useContext, useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectAuthIsValid, selectAuthIsInit, selectAuthIsComplete, setLogin } from './authSlice';
import { AppContext } from '../../app/App';

const GET_CURRENT_USER = gql`
  mutation GetCurrentUser {
    getCurrentUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useAuth() {
  const dispatch = useAppDispatch();

  const { setShowInitUserModal } = useContext(AppContext); 

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

      dispatch(setLogin(data.getCurrentUser));
    }
  });

  useEffect(() => {
    refreshToken();
  }, [])

  useEffect(() => {
    if (!isInit || isComplete) return;

    if (isValid) {
      setIsLoading(true);
      getUser();
    }
    else {
      setShowInitUserModal(true);
    }
  }, [isInit, isValid, isComplete]);
}
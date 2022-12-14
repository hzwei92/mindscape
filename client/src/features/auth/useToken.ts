import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { ACCESS_TOKEN, REFRESH_ACCESS_TOKEN_TIME } from '../../constants';
import { selectCurrentUser } from '../user/userSlice';
import { setAuthIsInit, setAuthIsValid, setTokenInterval } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN as REFRESH_TOKEN_KEY } from '../../constants';
import { useIonToast } from '@ionic/react';

const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken)
  }
`;

export default function useToken() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectCurrentUser);

  const [present] = useIonToast();

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      if (error.message === 'Invalid refresh token') {
        present('Your session has expired. Please log in again.', 3000);
        
        console.log('Invalid refresh token');
        if (user?.id) {
          //logoutUser(); TODO
        }

        dispatch(setAuthIsValid(false));
        dispatch(setAuthIsInit(true));
        dispatch(setTokenInterval(null));
      }
      else {
        console.error(error);
      }
    },
    onCompleted: data => {
      console.log(data);

      if (data.refreshToken) {
        Preferences.set({
          key: ACCESS_TOKEN,
          value: data.refreshToken,
        });

        dispatch(setAuthIsValid(true));
      }
      else {
        dispatch(setAuthIsValid(false));
        dispatch(setTokenInterval(null));
      }
      dispatch(setAuthIsInit(true));
    },
  });

  const refreshToken = async () => {
    const refreshToken = await Preferences.get({ key: REFRESH_TOKEN_KEY });

    if (refreshToken.value) {
      refresh({
        variables: {
          refreshToken: refreshToken.value,
        }
      });
    }
    else {
      dispatch(setAuthIsValid(false));
      dispatch(setTokenInterval(null));
      dispatch(setAuthIsInit(true));
    }
  }

  const refreshTokenInterval = () => {
    const interval = setInterval(async () => {
      const refreshToken = await Preferences.get({ key: REFRESH_TOKEN_KEY });
      if (refreshToken.value) {
        refresh({
          variables: {
            refreshToken: refreshToken.value || '',
          }
        });
      }
      else {
        dispatch(setAuthIsValid(false));
        dispatch(setTokenInterval(null));
        dispatch(setAuthIsInit(true));
      }
    }, REFRESH_ACCESS_TOKEN_TIME);
    
    dispatch(setTokenInterval(interval));
  }
  
  return { refreshToken, refreshTokenInterval };
}
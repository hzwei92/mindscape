import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { REFRESH_ACCESS_TOKEN_TIME } from '../../constants';
import { selectCurrentUser } from '../user/userSlice';
import { setAccessToken, setAuthIsInit, setAuthIsValid, setTokenInterval } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN as REFRESH_TOKEN_KEY } from '../../constants';

const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken)
  }
`;

export default function useToken() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectCurrentUser);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      if (error.message === 'invalid token') {
        console.log('Refresh Token Unauthorized');
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
        dispatch(setAccessToken(data.refreshToken));
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
    refresh({
      variables: {
        refreshToken: refreshToken.value,
      }
    });
  }

  const refreshTokenInterval = () => {
    const interval = setInterval(async () => {
      const refreshToken = await Preferences.get({ key: REFRESH_TOKEN_KEY });
      refresh({
        variables: {
          refreshToken: refreshToken.value,
        }
      });
    }, REFRESH_ACCESS_TOKEN_TIME);

    dispatch(setAuthIsInit(true));
    dispatch(setAuthIsValid(true));
    dispatch(setTokenInterval(interval));
  }
  
  return { refreshToken, refreshTokenInterval };
}
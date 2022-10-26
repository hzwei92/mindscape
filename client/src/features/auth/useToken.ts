import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { REFRESH_ACCESS_TOKEN_TIME } from '../../constants';
import { selectCurrentUser } from '../user/userSlice';
import { setAuthIsInit, setAuthIsValid, setTokenInterval } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN as REFRESH_TOKEN_KEY } from '../../constants';
const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      id
    }
  }
`;

export default function useToken() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectCurrentUser);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      if (error.message === 'Unauthorized') {
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

      if (data.refreshToken.id) {
        const cookies = document.cookie.split('; ');
        console.log('cookies', cookies);
        let authCookie;
        cookies.some(cookie => {
          authCookie = cookie.match(/^Authentication=.*$/);
          return !!authCookie;
        });
        if (authCookie && authCookie[0]) {

        }

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
    const cookies = document.cookie.split('; ');
    console.log('cookies', cookies);
    let refreshCookie;
    let refreshCookieIndex;
    cookies.some((cookie, i) => {
      refreshCookie = cookie.match(/^Refresh=.*$/);
      if (refreshCookie) {
        refreshCookieIndex = i;
        return true;
      }
      return false;
    });

    const storedRefreshCookie = await Preferences.get({
      key: REFRESH_TOKEN_KEY,
    });
    
    console.log('storedRefreshCookie', storedRefreshCookie);

    if (refreshCookie && refreshCookie[0] && refreshCookieIndex) {
      console.log(refreshCookie[0]);
      if (storedRefreshCookie.value && refreshCookie[0] !== storedRefreshCookie.value) {
        console.log(storedRefreshCookie.value);
        //cookies.splice(refreshCookieIndex, 1, storedRefreshCookie.value);
      }
    }
    else {
      if (storedRefreshCookie.value) {
        cookies.push(storedRefreshCookie.value);
      }
    }

    document.cookie = cookies.join('; ');

    refresh();
  }

  const refreshTokenInterval = () => {
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_ACCESS_TOKEN_TIME);

    dispatch(setAuthIsInit(true));
    dispatch(setAuthIsValid(true));
    dispatch(setTokenInterval(interval));
  }
  
  return { refreshToken, refreshTokenInterval };
}
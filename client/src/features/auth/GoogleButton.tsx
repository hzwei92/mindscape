import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID, REFRESH_TOKEN } from '../../constants';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { FULL_USER_FIELDS } from '../user/userFragments';
import useToken from './useToken';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { IonButton, IonButtons } from '@ionic/react';
import { selectAccessToken, setAccessToken } from './authSlice';
import { Preferences } from '@capacitor/preferences';

const REGISTER_USER = gql`
  mutation RegisterGoogleUser($accessToken: String!, $token: String!) {
    registerGoogleUser(accessToken: $accessToken, token: $token) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;

const LOGIN_USER = gql`
  mutation LoginGoogleUser($accessToken: String!, $token: String!) {
    loginGoogleUser(accessToken: $accessToken, token: $token) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;

interface GoogleButtonProps {
  isRegistration: boolean;
  onCompleted?: any;
}
export default function GoogleButton(props: GoogleButtonProps) {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);

  const [message, setMessage] = useState('');

  const { refreshTokenInterval } = useToken();

  const [registerGoogleUser] = useMutation(REGISTER_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: async data => {
      console.log(data);
      refreshTokenInterval();

      dispatch(setAccessToken(data.registerGoogleUser.accessToken));
      dispatch(setCurrentUser(data.registerGoogleUser));

      await Preferences.set({ key: REFRESH_TOKEN, value: data.registerGoogleUser.refreshToken });

      props.onCompleted && props.onCompleted();
    },
  });

  const [loginGoogleUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: async data => {
      console.log(data);
      refreshTokenInterval();

      dispatch(setAccessToken(data.loginGoogleUser.accessToken));
      dispatch(setCurrentUser(data.loginGoogleUser));

      await Preferences.set({ key: REFRESH_TOKEN, value: data.loginGoogleUser.refreshToken });

      props.onCompleted && props.onCompleted();
    },
  });

  const handleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('handleSuccess', response)
    if ('accessToken' in response) {
      if (props.isRegistration) {
        registerGoogleUser({
          variables: {
            accessToken,
            token: response.accessToken,
          },
        });
      }
      else {
        loginGoogleUser({
          variables: {
            accessToken,
            token: response.accessToken,
          }
        });
      }
    }
  }

  const handleFailure = (response: any) => {
    console.error(response);
    setMessage(response.message);
  }

  return (
    <div>
    <GoogleLogin
      clientId={GOOGLE_CLIENT_ID}
      render={renderProps => (
        <IonButtons>
          <IonButton onClick={renderProps.onClick}>
              {props.isRegistration ? 'REGISTER WITH GOOGLE' : 'LOGIN WITH GOOGLE'}
          </IonButton>
        </IonButtons>
      )}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
    <div>
      { message } 
    </div>   
    </div>
  );
}
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { ACCESS_TOKEN, GOOGLE_CLIENT_ID, REFRESH_TOKEN } from '../../constants';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { FULL_USER_FIELDS } from '../user/userFragments';
import useToken from './useToken';
import { useAppDispatch } from '../../app/store';
import { IonButton, IonButtons } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { setLogin } from './authSlice';
import { mergeUsers } from '../user/userSlice';

const REGISTER_USER = gql`
  mutation RegisterGoogleUser($token: String!) {
    registerGoogleUser(token: $token) {
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
  mutation LoginGoogleUser($token: String!) {
    loginGoogleUser(token: $token) {
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

      await Preferences.set({
        key: ACCESS_TOKEN,
        value: data.registerGoogleUser.accessToken,
      });

      await Preferences.set({ 
        key: REFRESH_TOKEN, 
        value: data.registerGoogleUser.refreshToken
      });

      dispatch(mergeUsers([data.registerGoogleUser.user]));

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


      await Preferences.set({
        key: ACCESS_TOKEN,
        value: data.loginGoogleUser.accessToken,
      });

      await Preferences.set({
        key: REFRESH_TOKEN, 
        value: data.loginGoogleUser.refreshToken
      });

      dispatch(setLogin(data.loginGoogleUser.user));

      props.onCompleted && props.onCompleted();
    },
  });

  const handleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('handleSuccess', response)
    if ('accessToken' in response) {
      if (props.isRegistration) {
        registerGoogleUser({
          variables: {
            token: response.accessToken,
          },
        });
      }
      else {
        loginGoogleUser({
          variables: {
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
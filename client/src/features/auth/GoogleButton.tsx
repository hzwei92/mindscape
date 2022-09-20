import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../../constants';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { FULL_USER_FIELDS } from '../user/userFragments';
import useToken from './useToken';
import { useAppDispatch } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { IonButton, IonButtons } from '@ionic/react';

const REGISTER_USER = gql`
  mutation RegisterGoogleUser($token: String!) {
    registerGoogleUser(token: $token) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

const LOGIN_USER = gql`
  mutation LoginGoogleUser($token: String!) {
    loginGoogleUser(token: $token) {
      ...FullUserFields
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
    onCompleted: data => {
      console.log(data);
      refreshTokenInterval();
      dispatch(setCurrentUser(data.registerGoogleUser));
      props.onCompleted && props.onCompleted();
    },
  });

  const [loginGoogleUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);
      refreshTokenInterval();
      dispatch(setCurrentUser(data.loginGoogleUser));
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
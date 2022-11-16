import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput, IonModal, IonPage } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import GoogleButton from '../features/auth/GoogleButton';
import { FULL_USER_FIELDS } from '../features/user/userFragments';
import { selectAccessToken, setAccessToken, setLogin } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../app/store';
import { AppContext } from '../app/App';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN } from '../constants';

const LOGIN_USER = gql`
  mutation LoginUser($accessToken: String!, $email: String!, $pass: String!) {
    loginUser(accessToken: $accessToken, email: $email, pass: $pass) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;

const LoginPage: React.FC = () => {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const { palette } = useContext(AppContext);

  const accessToken = useAppSelector(selectAccessToken);

  const [message, setMessage] = useState('');

  const [loginUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);

      client.clearStore();

      dispatch(setAccessToken(data.loginUser.accessToken))

      Preferences.set({
        key: REFRESH_TOKEN,
        value: data.loginUser.refreshToken,
      });
      
      dispatch(setLogin(data.loginUser.user));
    }
  });

  const [email, setEmail] = useState('');

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handlePassChange = (e: any) => {
    setPass(e.target.value);
  };
  const handleClickShowPass = () => {
    setShowPass(!showPass);
  };

  const handleSubmit = (event: React.MouseEvent) => {
    loginUser({
      variables: {
        accessToken,
        email,
        pass,
      }
    })
  };

  const isFormValid = email.length && pass.length;

  return (
    <IonPage style={{
      backgroundColor: palette === 'dark'
        ? '#000000'
        : '#e0e0e0',
    }}>
      <IonCard style={{
        top: 56,
        padding: 2,
        width: '350px'
      }}>
        <IonCardHeader>
          Login
        </IonCardHeader>
        <IonCardContent>
          <IonInput
            type='email'
            placeholder='Email'
            value={email}
            onIonChange={handleEmailChange}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <IonInput
              type={showPass ? 'text' : 'password'}
              placeholder='Password'
              value={pass}
              onIonChange={handlePassChange}
            />
            <IonButtons>
              <IonButton onClick={handleClickShowPass}>
                <IonIcon icon={showPass ? eye : eyeOff} size='small'/>
              </IonButton>
            </IonButtons>
          </div>
          <div>
            { message }
          </div>
          <IonButtons>
            <IonButton disabled={!isFormValid} onClick={handleSubmit}>
              LOGIN WITH EMAIL
            </IonButton>
          </IonButtons>
          <GoogleButton isRegistration={false} />
        </IonCardContent>
      </IonCard>
    </IonPage>
  );
}

export default LoginPage;

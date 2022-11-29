import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput, IonModal, IonPage } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import GoogleButton from '../auth/GoogleButton';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { setLogin } from '../auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { Preferences } from '@capacitor/preferences';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $pass: String!) {
    loginUser(email: $email, pass: $pass) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;


interface LoginModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

const LoginModal = (props: LoginModalProps) => {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const { palette } = useContext(AppContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const [message, setMessage] = useState('');

  const [loginUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: async data => {
      console.log(data);

      client.clearStore();

      await Preferences.set({
        key: ACCESS_TOKEN,
        value: data.loginUser.accessToken,
      });

      await Preferences.set({
        key: REFRESH_TOKEN,
        value: data.loginUser.refreshToken,
      });
      
      dispatch(setLogin(data.loginUser.user));
    }
  });

  const [email, setEmail] = useState('');

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (props.show) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [props.show]);

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
        email,
        pass,
      }
    })
  };

  const handleClose = () => {
    props.setShow(false);
  }

  const isFormValid = email.length && pass.length;

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard style={{
        padding: 10,
        height: '100%',
        width: '100%',
        margin: 0,
      }}>
        <IonCardHeader style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          fontSize: 80,
          textAlign: 'center',
          marginBottom: 60,
        }}>
          Welcome back!
        </IonCardHeader>
        <IonCardContent style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <div>
          <IonInput
            type='email'
            placeholder='Email'
            value={email}
            onIonChange={handleEmailChange} 
            style={{
              marginBottom: 10,
              border: '1px solid',
              borderRadius: 5,
              width: 300,
            }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            border: '1px solid',
            borderRadius: 5,
            marginBottom: 10,
            width: 300,
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
          <IonButtons style={{
            marginBottom: 60,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <IonButton disabled={!isFormValid} onClick={handleSubmit}>
              LOGIN WITH EMAIL
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <GoogleButton isRegistration={false} />
          </div>

          </div>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
}

export default LoginModal;

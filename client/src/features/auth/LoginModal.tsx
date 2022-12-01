import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput, IonItem, IonModal, IonPage } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import GoogleButton from './GoogleButton';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { setLogin } from './authSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { Preferences } from '@capacitor/preferences';
import { ACCESS_TOKEN, INPUT_WIDTH, REFRESH_TOKEN } from '../../constants';

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


const LoginModal = () => {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const { user, showLoginModal, setShowLoginModal, setShowInitUserModal } = useContext(AppContext);

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
    if (showLoginModal) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [showLoginModal]);

  const handleEmailChange = (e: any) => {
    setMessage('')
    setEmail(e.target.value);
  };

  const handlePassChange = (e: any) => {
    setMessage('');
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
    setShowLoginModal(false);
  };

  const handleCancelClick = () => {
    if (!user) {
      setShowInitUserModal(true);
    }
    handleClose();
  }
  const handleClose = () => {
    setShowLoginModal(false);
  }

  const isFormValid = email.length && pass.length;

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose} canDismiss={!(showLoginModal && !user?.id)}>
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
          fontSize: 60,
          textAlign: 'center',
        }}>
          Welcome back!
        </IonCardHeader>
        <IonCardContent style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <div>
            <IonItem style={{
              marginBottom: 10,
              border: '1px solid',
              borderRadius: 5,
              width: INPUT_WIDTH,
            }}>
              <IonInput
                type='email'
                placeholder='Email'
                value={email}
                onIonChange={handleEmailChange} 
                style={{
                }}
              />
            </IonItem>

          <IonItem style={{
            border: '1px solid',
            borderRadius: 5,
            marginBottom: 10,
            width: INPUT_WIDTH,
          }}>
            <IonInput
              type={showPass ? 'text' : 'password'}
              placeholder='Password'
              value={pass}
              onIonChange={handlePassChange}
              style={{
              }}
            />
            <IonButtons>
              <IonButton onClick={handleClickShowPass}>
                <IonIcon icon={showPass ? eye : eyeOff} size='small'/>
              </IonButton>
            </IonButtons>
          </IonItem>
          <div>
            { message }
          </div>
          <IonButtons style={{
            marginBottom: 50,
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
            <GoogleButton isRegistration={false} onCompleted={() => {setShowLoginModal(false)}}/>
          </div>
          <IonButtons style={{
            marginTop: 50,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <IonButton onClick={handleCancelClick}>
              CANCEL
            </IonButton>
          </IonButtons>
          </div>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
}

export default LoginModal;

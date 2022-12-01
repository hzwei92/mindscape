import { gql, useLazyQuery, useMutation } from '@apollo/client';
import React, { useContext, useState } from 'react';
import GoogleButton from './GoogleButton';
import { USER_FIELDS } from '../user/userFragments';
import { useAppDispatch } from '../../app/store';
import { EMAIL_REGEX } from '../../constants';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonInput, IonItem } from '@ionic/react';
import { mergeUsers } from '../user/userSlice';

const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      email
    }
  }
`;

const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $pass: String!) {
    registerUser(email: $email, pass: $pass) {
      user {
        ...UserFields
      }
      accessToken
      refreshToken
    }
  }
  ${USER_FIELDS}
`;

export default function Register() {
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTimeout, setEmailTimeout] = useState(null as any);

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [message, setMessage] = useState('');

  const [getUserByEmail] = useLazyQuery(GET_USER_BY_EMAIL, {
    onCompleted: data => {
      console.log(data);
      setEmailError(data.getUserByEmail ? 'Email is already in use' : '');
    }
  });

  const [registerUser] = useMutation(REGISTER_USER, {
    onError: error => {
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([Object.assign({}, user, data.registerUser.user)]));
    }
  })

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setMessage('');
    if (event.target.value.length === 0) {
      setEmailError('');
    }
    else  if (EMAIL_REGEX.test(event.target.value.toLowerCase())) {
      if (emailTimeout) {
        clearTimeout(emailTimeout);
      }
      const t = setTimeout(() => {
        getUserByEmail({
          variables: {
            email: event.target.value.toLowerCase(),
          }
        });
        setEmailTimeout(null);
      }, 500);

      setEmailTimeout(t); 
      setEmailError('');
    }
    else {
      setEmailError('Please enter a valid email')
    }
  };

  const handlePassChange = (event: any) => {
    setPass(event.target.value);
    setMessage('')
  };

  const handleClickShowPass = () => {
    setShowPass(!showPass);
  };

  const handleMouseDownPass = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.MouseEvent) => {
    setMessage('')
    registerUser({
      variables: {
        email,
        pass,
        isGoogle: false,
      }
    });
  };

  const isFormValid = email.length && !emailError && pass.length;

  return (
      <IonCard>
        <IonCardHeader style={{
          fontWeight: 'bold',
        }}>
          Email
        </IonCardHeader>
        <IonCardContent>
          <IonItem style={{
            marginTop: 10,
            marginBottom: 10,
            width: 290,
            border: '1px solid',
            borderRadius: 5,
          }}>
            <IonInput
              type='email'
              placeholder='Email'
              value={email}
              onIonChange={handleEmailChange}
            />
          </IonItem>
          <IonItem style={{
            marginBottom: '10px',
            width: 290,
            border: '1px solid',
            borderRadius: 5,
          }}>
            <IonInput
              type={showPass ? 'text' : 'password'}
              placeholder='Password'
              value={pass}
              onIonChange={handlePassChange}
            />
          </IonItem>
          <div>
            {message}
          </div>
        <IonButtons>
          <IonButton
            disabled={!isFormValid}
            onClick={handleSubmit} 
          >
            REGISTER WITH EMAIL
          </IonButton>
        </IonButtons>
        <div style={{marginTop: 20}}>
          <GoogleButton isRegistration={true}/>
        </div>
        </IonCardContent>
      </IonCard>
  );
}
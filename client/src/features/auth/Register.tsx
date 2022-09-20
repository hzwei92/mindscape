import { gql, useLazyQuery, useMutation } from '@apollo/client';
import React, { useContext, useState } from 'react';
import GoogleButton from './GoogleButton';
import { USER_FIELDS } from '../user/userFragments';
import { useAppDispatch } from '../../app/store';
import { setCurrentUser } from '../user/userSlice';
import { EMAIL_REGEX } from '../../constants';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonInput } from '@ionic/react';

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
      ...UserFields
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
      dispatch(setCurrentUser(Object.assign({}, user, data.registerUser)));
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
        <IonCardHeader>
          Email
        </IonCardHeader>
        <IonCardContent>
          <IonInput
            type='email'
            placeholder='Email'
            value={email}
            onIonChange={handleEmailChange}
          />
          <IonInput
            type={showPass ? 'text' : 'password'}
            placeholder='Password'
            value={pass}
            onIonChange={handlePassChange}
          />
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
        <div>
          <GoogleButton isRegistration={true}/>
        </div>
        </IonCardContent>
      </IonCard>
  );
}
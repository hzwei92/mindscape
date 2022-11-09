import { gql, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonHeader, IonInput } from '@ionic/react';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { mergeUsers } from '../user/userSlice';
import { selectAccessToken } from './authSlice';

const VERIFY_USER = gql`
  mutation VerifyUser($accessToken: String!, $code: String!) {
    verifyUser(accessToken: $accessToken, code: $code) {
      id
      verifyEmailDate
    }
  }
`;

const RESEND_USER_VERIFICATION = gql`
  mutation ResendUserVerifcation($accessToken: String!) {
    resendUserVerification(accessToken: $accessToken) {
      id
    }
  }
`;

export default function Verify() {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  
  const [verifyUser] = useMutation(VERIFY_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.verifyUser]));
    }
  });

  const [resendUserVerification] = useMutation(RESEND_USER_VERIFICATION, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  })

  const handleCodeChange = (event:any) => {
    setCode(event.target.value);
  }

  const handleSubmitClick = (event: React.MouseEvent) => {
    verifyUser({
      variables: {
        accessToken,
        code,
      },
    });
  }

  const handleResendClick = (event: React.MouseEvent) => {
    resendUserVerification({
      variables: {
        accessToken,
      }
    });
  }

  return (
    <IonCard>
      <IonCardHeader>
        Verify email
      </IonCardHeader>
      <IonCardContent>

      <div>
        {message}
      </div>
      <IonInput 
        type="text"
        placeholder="Verification code"
        value={code}
        onIonChange={handleCodeChange}
      />
      <IonButtons>
        <IonButton onClick={handleSubmitClick}>
          Verify
        </IonButton>
        <IonButton onClick={handleResendClick}>
          Resend
        </IonButton>
      </IonButtons>
      </IonCardContent>
    </IonCard>
  )

}
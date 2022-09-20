import { gql, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonHeader, IonInput } from '@ionic/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from '../user/userSlice';
const VERIFY_USER = gql`
  mutation VerifyUser($code: String!) {
    verifyUser(code: $code) {
      id
      verifyEmailDate
    }
  }
`;

const RESEND_USER_VERIFICATION = gql`
  mutation ResendUserVerifcation {
    resendUserVerification {
      id
    }
  }
`;

export default function Verify() {
  const dispatch = useAppDispatch();

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
        code,
      },
    });
  }

  const handleResendClick = (event: React.MouseEvent) => {
    resendUserVerification();
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
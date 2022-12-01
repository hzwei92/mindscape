import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonInput, IonItem, IonLabel, IonModal, IonNote } from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";
import { ChromePicker } from "react-color";
import { AppContext } from "../../app/App";
import useInitUser from "./useInitUser";
import { gql, useMutation } from "@apollo/client";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { INPUT_WIDTH } from "../../constants";

const GET_USER_BY_NAME = gql`
  mutation GetUserByName($name: String!) {
    getUserByName(name: $name) {
      id
      name
    }
  }
`;

export default function InitUserModal() {
  const { palette, showInitUserModal, setShowInitUserModal, setShowLoginModal } = useContext(AppContext);

  const [isNewUser, setIsNewUser] = useState(false);

  const [name, setName] = useState('');

  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [nameError, setNameError] = useState(false);

  const [color, setColor] = useState('#ffffff');

  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    if (!showInitUserModal) return;

    const name1 = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-'
    }) + '-' + Math.round(Math.random() * 1000).toString().padStart(3, '0');

    const color1 = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0');

    setName(name1);
    setColor(color1);
  }, [showInitUserModal]);

  useEffect(() => {
    if (showInitUserModal) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [showInitUserModal])

  const [getUserByName] = useMutation(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUserByName?.id) {
        setNameError(true);
      }
      else {
        setNameError(false);
      }
    }
  });

  const { initUser } = useInitUser(() => {
    setIsNewUser(false);
  });

  const handleNameChange = (e: any) => {
    console.log('hi')
    setName(e.target.value);
    if (nameTimeout) {
      clearTimeout(nameTimeout);
    }
    const timeout = setTimeout(() => {
      getUserByName({
        variables: {
          name: e.target.value,
        },
      });
      setNameTimeout(null);
    }, 400);
    setNameTimeout(timeout);
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleSubmit = () => {
    if (nameError) {
      console.log(nameError);
    }
    else {
      initUser(
        name,
        color,
        palette,
      );
      setShowInitUserModal(false);
    }
  }

  const handleReturningUserClick = () => {
    setShowInitUserModal(false);
    setShowLoginModal(true);
  }

  return (
    <IonModal ref={modalRef} canDismiss={!showInitUserModal}>
      <IonCard style={{
        margin: 0,
        height: '100%',
        width: '100%',
      }}>
        <IonCardHeader style={{
          fontSize: 60,
          textAlign: 'center',
        }}>
          Welcome!
        </IonCardHeader>
        {
        isNewUser
          ? (
            <IonCardContent style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: -10,
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  marginBottom: 10,
                  textAlign: 'center',
                }}>
                  Choose a name and a color.
                </div>
                <div>
                  <IonItem style={{
                    width: INPUT_WIDTH,
                    marginBottom: 10,
                    border: '1px solid',
                    borderRadius: 5,
                  }}>
                    <IonInput
                      placeholder="Name"
                      value={name}
                      onIonChange={handleNameChange}
                      style={{
                        width: 300,
                      }}
                    />
                  </IonItem>
    
                {
                  nameError
                    ? <IonNote color={'danger'}>This name is already in use.</IonNote>
                    : null
                }
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                  <ChromePicker
                    color={color}
                    disableAlpha={true} 
                    onChange={handleColorChange} 
                  />
                </div>
                <IonButtons style={{
                  marginTop: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <IonButton disabled={!!nameTimeout || nameError} onClick={handleSubmit} style={{
                    marginBottom: 10,
                  }}>
                    START
                  </IonButton>
                  <IonButton onClick={() => setIsNewUser(false)} style={{
                  }}>
                    CANCEL
                  </IonButton>
                </IonButtons>
              </div>
            </IonCardContent>
            )
          : (
            <IonCardContent style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <IonButtons style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <IonButton onClick={() => setIsNewUser(true)} style={{
                  marginBottom: 20,
                }}>
                  NEW USER
                </IonButton>
                <IonButton onClick={handleReturningUserClick} >
                  RETURNING USER
                </IonButton>
              </IonButtons>
            </IonCardContent>
            )
      }

      </IonCard>
    </IonModal>
  )
}
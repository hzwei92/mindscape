import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonInput, IonModal, IonNote } from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";
import { ChromePicker } from "react-color";
import { AppContext } from "../../app/App";
import useInitUser from "./useInitUser";
import { gql, useMutation } from "@apollo/client";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

const GET_USER_BY_NAME = gql`
  mutation GetUserByName($name: String!) {
    getUserByName(name: $name) {
      id
      name
    }
  }
`;

export default function InitUserModal() {
  const { palette, showInitUserModal } = useContext(AppContext);

  const [name, setName] = useState('');

  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [nameError, setNameError] = useState(false);

  const [color, setColor] = useState('#ffffff');

  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const name1 = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-'
    }) + '-' + Math.round(Math.random() * 1000).toString().padStart(3, '0');

    const color1 = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0');

    setName(name1);
    setColor(color1);
  }, []);

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

  const { initUser } = useInitUser();

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
    }
  }

  return (
    <IonModal ref={modalRef} canDismiss={!showInitUserModal}>
      <IonCard style={{
        margin: 0,
        height: '100%',
        width: '100%',
      }}>
        <IonCardHeader style={{
          fontSize: 80,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          Welcome!
        </IonCardHeader>
        <IonCardContent style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Choose a name and a color.
            </div>
            <div>
            <IonInput
              placeholder="Name"
              value={name}
              onIonChange={handleNameChange}
              style={{
                borderRadius: 5,
                border: '1px solid',
                borderColor: nameError ? 'red' : null,
              }}
            />
            {
              nameError
                ? <IonNote color={'danger'}>This name is already in use.</IonNote>
                : null
            }
            </div>
            <div style={{
              marginTop: 20,
            }}>
              <ChromePicker color={color} onChange={handleColorChange} />
            </div>
            <IonButtons style={{
              marginTop: 30,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <IonButton disabled={!!nameTimeout || nameError} onClick={handleSubmit} style={{
              }}>
                START
              </IonButton>
            </IonButtons>
          </div>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}
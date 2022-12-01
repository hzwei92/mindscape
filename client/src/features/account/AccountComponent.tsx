import { gql, useMutation } from "@apollo/client";
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput } from "@ionic/react"
import { createOutline, send } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectSessionId } from "../auth/authSlice";
import Register from "../auth/Register";
import Verify from "../auth/Verify";
import { mergeUsers } from "../user/userSlice";
import useSetUserColor from "../user/useSetUserColor";
import LoginModal from "../auth/LoginModal";
import LogoutModal from "./LogoutModal";

const SET_USER_NAME = gql`
  mutation SetUserName($sessionId: String!, $name: String!) {
    setUserName(sessionId: $sessionId, name: $name) {
      id
      name
      lowercaseName
      routeName
    }
  }
`;

const GET_USER_BY_NAME = gql`
  mutation GetUserByName($name: String!) {
    getUserByName(name: $name) {
      id
      name
    }
  }
`;

const AccountComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const { user, palette, showLoginModal, setShowLoginModal } = useContext(AppContext);
  
  const sessionId = useAppSelector(selectSessionId);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name);
  const [nameError, setNameError] = useState('');
  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [color, setColor] = useState(null as string | null);
  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  
  const { setUserColor } = useSetUserColor();
   
  const [getUserByName] = useMutation(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUserByName?.id && data.getUserByName.id !== user?.id) {
        setNameError('This name is already in use');
      }
    }
  });

  const [setUserName] = useMutation(SET_USER_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserName]));
    }
  })

  useEffect(() => {
    if (user?.color) {
      setColor(user.color);
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.color && !color) {
      setColor(user.color);
    }
  }, [user?.color, color]);

  
  const handleNameEditClick = (event: React.MouseEvent) => {
    setIsEditingName(true);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
    setNameError('');
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
    }, 300);
    setNameTimeout(timeout);
  }
  const handleNameSubmitClick = () => {
    setUserName({
      variables: {
        name,
        sessionId: sessionId,
      }
    })
    setIsEditingName(false);
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setUserColor(color.hex);

      setColorTimeout(null);
    }, 500);

    setColorTimeout(timeout);
  };

  const handleLoginClick = (event: React.MouseEvent) => {
    setShowLoginModal(true);
  };

  const handleLogoutClick = (event: React.MouseEvent) => {
    setShowLogoutModal(true);
  }
  
  return (
    <IonCard style={{
      backgroundColor: palette === 'dark'
        ? '#000000'
        : '#e0e0e0',
      margin: 0,
      borderRadius: 0,
      height: '100%',
      overflowY: 'scroll',
    }}>
      <IonCardHeader style={{
        padding: 10,
      }}>
        ACCOUNT
      </IonCardHeader>
        <IonCard style={{
          padding: 10,
        }}> 
            <IonButtons>
              <IonButton onClick={handleLogoutClick}>
                LOGOUT
              </IonButton>
              <IonButton onClick={handleLoginClick}>
                LOGIN
              </IonButton>
            </IonButtons>
        </IonCard>
        <IonCard style={{
          marginTop: 0,
        }}>
          <IonCardHeader style={{
            fontWeight: 'bold',
          }}>
            Name
          </IonCardHeader> 
          <IonCardContent >
            <div style={{
              display: isEditingName
                ? 'none'
                : 'flex',
              flexDirection: 'row',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                { user?.name }&nbsp;
              </div>
              <IonButtons style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <IonButton size='small' onClick={handleNameEditClick}>
                  <IonIcon icon={createOutline} size='small'/>
                </IonButton>
              </IonButtons>
              { nameError || null }
            </div>
            <div style={{
              display: isEditingName
                ? 'flex'
                : 'none',
              flexDirection: 'row',
            }}>
              <IonInput 
                value={name}
                onIonChange={handleNameChange}
              />
              <IonButtons style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <IonButton size='small' onClick={handleNameSubmitClick}>
                  <IonIcon icon={send} size='small'/>
                </IonButton>
              </IonButtons>
            </div>
          </IonCardContent>
        </IonCard>
        {
          user?.email
            ? user?.verifyEmailDate
              ? <IonCard>
                  <IonCardHeader style={{
                    fontWeight: 'bold',
                  }}>
                    Email
                  </IonCardHeader>
                  <IonCardContent>
                    { user?.email }
                  </IonCardContent>
                </IonCard>
              : <Verify />
            : <Register />
        }
        <IonCard>
          <IonCardHeader style={{
            fontWeight: 'bold',
          }}>
            Color
          </IonCardHeader>
          <IonCardContent>
            <ChromePicker
              color={color || '#ffffff'}
              disableAlpha={true}
              onChange={handleColorChange}
              onChangeComplete={handleColorChangeComplete}
            />
          </IonCardContent>
        </IonCard>
      <LogoutModal show={showLogoutModal} setShow={setShowLogoutModal}/>
    </IonCard>
  );
};

export default AccountComponent;
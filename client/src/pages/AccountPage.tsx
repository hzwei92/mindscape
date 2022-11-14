import { gql, useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput, IonPage } from "@ionic/react"
import { createOutline, send } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { AppContext } from "../app/App";
import { useAppDispatch, useAppSelector } from "../app/store";
import { selectAccessToken, selectSessionId } from "../features/auth/authSlice";
import Register from "../features/auth/Register";
import Verify from "../features/auth/Verify";
import { mergeUsers } from "../features/user/userSlice";
import useSetUserColor from "../features/user/useSetUserColor";

const SET_USER_NAME = gql`
  mutation SetUserName($accessToken: String!, $sessionId: String!, $name: String!) {
    setUserName(accessToken: $accessToken, sessionId: $sessionId, name: $name) {
      id
      name
      lowercaseName
      routeName
    }
  }
`;

const GET_USER_BY_NAME = gql`
  query GetUserByName($accessToken: String!, $name: String!) {
    getUserByName(accessToken: $accessToken, name: $name) {
      id
      name
    }
  }
`;

const AccountPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { user, palette } = useContext(AppContext);
  
  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name);
  const [nameError, setNameError] = useState('');
  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [color, setColor] = useState(null as string | null);
  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  
  const { setUserColor } = useSetUserColor();
   
  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME, {
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
          accessToken,
          name: e.target.value,
        },
      });
    }, 300);
    setNameTimeout(timeout);
  }
  const handleNameSubmitClick = () => {
    setUserName({
      variables: {
        accessToken,
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
  
  return (
    <IonPage>
      <IonCard style={{
        backgroundColor: palette === 'dark'
          ? '#000000'
          : '#e0e0e0',
        height: 'calc(100% - 44px)',
        top: 44,
        margin: 0,
        paddingTop: 12,
        borderRadius: 0,
      }}>
        <IonCardHeader>
          Account
        </IonCardHeader>
        <IonCardContent>
          <IonCard>
            <IonCardHeader>
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
                    <IonCardHeader>
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
            <IonCardHeader>
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
        </IonCardContent>
      </IonCard>
    </IonPage>
  );
};

export default AccountPage;
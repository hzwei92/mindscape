import { gql, useMutation } from "@apollo/client";
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonLabel, IonModal, useIonRouter } from "@ionic/react";
import md5 from "md5";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../app/App";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import { User } from "./user";
import { USER_FIELDS } from "./userFragments";
import { getTimeString } from "../../utils";
import { close } from "ionicons/icons";
import { Arrow } from "../arrow/arrow";
 
const GET_USER = gql`
  mutation GetUser($userId: String!) {
    getUser(userId: $userId) {
      ...UserFields
      tabs {
        ...FullTabFields
      }
    }
  }
  ${USER_FIELDS}
  ${FULL_TAB_FIELDS}
`;


export default function UserModal() {
  const { user, selectedUserId, setSelectedUserId } = useContext(AppContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const [user1, setUser1] = useState(null as User | null);

  const router = useIonRouter();

  const [getUser] = useMutation(GET_USER, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      setUser1(data.getUser);
    }
  });

  useEffect(() => {
    if (selectedUserId) {
      modalRef.current?.present();
      getUser({
        variables: {
          userId: selectedUserId,
        }
      });
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [selectedUserId]);

  const handleArrowClick = (arrow: Arrow) => () => {
    router.push(`/g/${arrow.routeName}`);
    handleClose();
  }
  const handleClose = () => {
    setSelectedUserId('');
    setUser1(null);
  }

  const time = new Date(user1?.activeDate || Date.now()).getTime();
  const timeString = getTimeString(time);

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard style={{
        margin: 0,
        height: '100%',
      }}>
        <IonCardHeader style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {
                user1?.verifyEmailDate
                  ? <IonAvatar
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 8,
                        display: 'inline-block',
                        border: `1px solid ${user1.color}`
                      }}
                    >
                      <img src={`https://www.gravatar.com/avatar/${md5(user1?.email)}?d=retro`}/>
                    </IonAvatar>
                  : null
              }
            </div>
            <div>
              <span  style={{
                color: user1?.color,
              }}>
                {user1?.name}
              </span>
              &nbsp;
              { user1?.id ? timeString: null }
              <br/>
              { 
                user1
                  ? user1.balance + ' points'
                  : null
              }
            </div>
            <div style={{
              display: true || !user1?.id || user1?.id === user?.id
                ? 'none'
                : 'block',
              marginLeft: 10,
            }}>
              <IonButtons>
                <IonButton>
                  FOLLOW
                </IonButton>
              </IonButtons>
            </div>
          </div>
          <div>
            <IonButtons>
              <IonButton onClick={handleClose}>
                <IonIcon icon={close}/>
              </IonButton>
            </IonButtons>
          </div>
        </IonCardHeader>
        <IonCardContent style={{
          height: 'calc(100% - 55px)',
          overflowY: 'scroll',
        }}>
          {
            (user1?.tabs || [])
              .sort((a, b) => a.i - b.i)
              .map((tab, i) => {
                return (
                  <IonCard key={tab.id}>
                    <IonCardHeader >
                      <IonLabel onClick={handleArrowClick(tab.arrow)} style={{
                        cursor: 'pointer',
                      }}>
                        {i + 1}&nbsp;&nbsp;&nbsp;
                        <span style={{
                          color: tab.arrow.color,
                        }}>
                          {tab.arrow.title}
                        </span>
                        &nbsp;&nbsp;
                        /g/{tab.arrow.routeName}
                      </IonLabel>
                    </IonCardHeader>
                  </IonCard>
                );
              })
          }
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
}
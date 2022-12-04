import { gql, useMutation } from "@apollo/client";
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonLabel, IonModal, isPlatform, useIonRouter } from "@ionic/react";
import md5 from "md5";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../app/App";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import { USER_FIELDS } from "./userFragments";
import { getTimeString } from "../../utils";
import { close } from "ionicons/icons";
import { Arrow } from "../arrow/arrow";
import useFollowUser from "../lead/useFollowUser";
import useUnfollowUser from "../lead/useUnfollowUser";
import { mergeUsers, selectUserById } from "./userSlice";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectIdToLead, selectLeaderIdToLeadId } from "../lead/leadSlice";
import { NOTCH_SIZE } from "../../constants";
 
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
  const dispatch = useAppDispatch();

  const { user, selectedUserId, setSelectedUserId } = useContext(AppContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const user1 = useAppSelector(state => selectUserById(state, selectedUserId));
  console.log(user1);
  const leaderIdToLeadId = useAppSelector(selectLeaderIdToLeadId);
  const idToLead = useAppSelector(selectIdToLead);

  const lead = idToLead[leaderIdToLeadId[selectedUserId]];

  const router = useIonRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { followUser } = useFollowUser();
  const { unfollowUser } = useUnfollowUser();

  const [getUser] = useMutation(GET_USER, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      setIsLoading(false);
      dispatch(mergeUsers([data.getUser]));
    }
  });

  useEffect(() => {
    if (selectedUserId) {
      modalRef.current?.present();
      setIsLoading(true);
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

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user1?.id) {
      followUser(user1.id);
    }
  }

  const handleUnfollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead?.id) {
      unfollowUser(lead.id)
    }
  }

  const handleClose = () => {
    setSelectedUserId('');
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
          marginTop: isPlatform('iphone') && !isPlatform('mobileweb') 
            ? NOTCH_SIZE 
            : 0,
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
                user1?.balance !== undefined
                  ? user1.balance.toLocaleString() + ' points'
                  : null
              }
            </div>
            <div style={{
              display: !user1?.id || user1?.id === user?.id
                ? 'none'
                : 'block',
              marginLeft: 10,
            }}>
              <IonButtons>
                {
                  lead?.id && !lead.deleteDate
                    ? <IonButton onClick={handleUnfollowClick}>
                        UNFOLLOW
                      </IonButton>
                    : <IonButton onClick={handleFollowClick}>
                        FOLLOW
                      </IonButton>
                }
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
            (user1?.tabs || []).slice()
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
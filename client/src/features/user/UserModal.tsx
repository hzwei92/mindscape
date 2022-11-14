import { gql, useMutation } from "@apollo/client";
import { IonAvatar, IonCard, IonCardContent, IonCardHeader, IonLabel, IonModal } from "@ionic/react";
import md5 from "md5";
import { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { selectAccessToken } from "../auth/authSlice";
import { Tab } from "../tab/tab";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import useCreateTab from "../tab/useCreateTab";
import { User } from "./user";
import { USER_FIELDS } from "./userFragments";
import { selectIdToTab } from "../tab/tabSlice";
 
const GET_USER = gql`
  mutation GetUser($accessToken: String!, $userId: String!) {
    getUser(accessToken: $accessToken, userId: $userId) {
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

  const accessToken = useAppSelector(selectAccessToken);

  const idToTab = useAppSelector(selectIdToTab);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const [user1, setUser1] = useState(null as User | null);

  const { createTab } = useCreateTab();

  const history = useHistory();

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
          accessToken,
          userId: selectedUserId,
        }
      });
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [selectedUserId]);

  const handleArrowClick = (arrowId: string) => () => {
    let arrowTab = null as Tab | null;
    Object.values(idToTab)
      .filter(tab => !tab.deleteDate)
      .sort((a, b) => a.i - b.i)
      .map(tab => {
        if (tab.arrowId === arrowId) {
          arrowTab = tab;
        }
        return !!arrowTab;
      });
    if (arrowTab) {
      history.push(`/g/${arrowTab?.arrow.routeName}/0`);
    }
    else {
      createTab(arrowId, null, false, true);
    }
    handleClose();
  }
  const handleClose = () => {
    setSelectedUserId('');
    setUser1(null);
  }

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard>
        <IonCardHeader style={{
          color: user1?.color,
        }}>
          {
            user1?.verifyEmailDate
              ? <IonAvatar
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 7,
                    display: 'inline-block',
                    border: `1px solid ${user1.color}`
                  }}
                >
                  <img src={`https://www.gravatar.com/avatar/${md5(user1?.email)}?d=retro`}/>
                </IonAvatar>
              : null
          }
          {user1?.name}
        </IonCardHeader>
        <IonCardContent>
          {
            (user1?.tabs || []).map((tab, i) => {
              return (
                <IonCard key={tab.id}>
                  <IonCardHeader >
                    <IonLabel onClick={handleArrowClick(tab.arrowId)} style={{
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
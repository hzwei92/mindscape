import { IonAvatar, IonBadge, IonButton, IonButtons, IonCard, IonIcon } from "@ionic/react";
import md5 from "md5";
import { useContext, useEffect } from "react";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectAuthIsValid } from "../auth/authSlice";
import { SpaceContext } from "../space/SpaceComponent";
import useGetAlerts from "../alerts/useGetAlerts";
import { selectIdToAlert } from "../alerts/alertSlice";
import { MenuMode } from "../menu/menu";
import { IdToType } from "../../types";
import { Alert } from "../alerts/alert";
import { Entry } from "../entry/entry";
import { selectIdToArrow } from "../arrow/arrowSlice";
import { v4 } from "uuid";
import { mergeEntries } from "../entry/entrySlice";
import { searchPushSlice } from "../search/searchSlice";
import { gql, useMutation } from "@apollo/client";
import { mergeUsers } from "../user/userSlice";
import useAlertsSub from "../alerts/useAlertsSub";
import { reloadOutline } from "ionicons/icons";

const READ_ALERTS = gql`
  mutation ReadAlerts {
    readAlerts {
      id
      checkAlertsDate
    }
  }
`;

export default function CurrentUserTag() {
  const dispatch = useAppDispatch();

  const { user, setMenuMode } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);

  useAlertsSub();

  const isValid = useAppSelector(selectAuthIsValid);

  const idToArrow = useAppSelector(selectIdToArrow);
  const idToAlert = useAppSelector(selectIdToAlert);

  const [markRead] = useMutation(READ_ALERTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.readAlerts]));
    },
  });

  const alerts = user 
    ? Object.values(idToAlert)
        .filter(alert => 
          !!alert.id && 
          !alert.deleteDate && 
          alert.createDate > user.checkAlertsDate
        )
        .sort((a, b) => a.createDate < b.createDate ? -1 : 1)
    : [];
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  const { getAlerts } = useGetAlerts();

  useEffect(() => {
    getAlerts();
  }, []);

  const handleGetAlertsClick = () => {
    getAlerts();
  };

  const handleAlertsClick = () => {
    markRead();
    const sourceIdToAlerts = alerts.reduce((acc, alert) => {
      if (alert.source?.id) {
        acc[alert.source.id] = [
          ...(acc[alert.source.id] ?? []),
          alert
        ];
      }
      return acc;
    }, {} as IdToType<Alert[]>);

    const idToEntry: IdToType<Entry> = {};
    const entryIds: string[] = [];
    Object.keys(sourceIdToAlerts).forEach(sourceId => {
      const source = idToArrow[sourceId];
      const alerts = sourceIdToAlerts[sourceId];

      const sourceEntry: Entry = {
        id: v4(),
        userId: source.userId,
        parentId: null,
        arrowId: source.id,
        showIns: false,
        showOuts: !!alerts.length,
        inIds: [],
        outIds: [],
        sourceId: null,
        targetId: null,
        shouldGetLinks: false,
        isDeleted: false,
      };

      idToEntry[sourceEntry.id] = sourceEntry;

      
      alerts.forEach(alert => {
        const { link, source, target, lead, role, abstractRole, reason } = alert;

        let linkBonus: string[] = [];
        let targetBonus: string[] = [];

        if (lead?.leaderId === link?.userId) {
          linkBonus.push('Written by a user you follow');
        }

        if (source?.userId === user?.id) {
          linkBonus.push('In response to an arrow you wrote');
        }
        else if (role?.arrowId === sourceId) {
          linkBonus.push('In response to an arrow you subscribe to');
        }

        if (abstractRole?.arrowId === link?.abstractId) {
          linkBonus.push('Within a graph you subscribe to');
        }


        if (link?.id && target?.id) {
          const targetEntryId = v4();

          const linkEntry: Entry = {
            id: v4(),
            userId: link.userId,
            parentId: sourceEntry.id,
            arrowId: link.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: sourceEntry.id,
            targetId: targetEntryId,
            shouldGetLinks: false,
            isDeleted: false,
            bonusText: linkBonus,
          };

          sourceEntry.outIds.push(linkEntry.id);

          idToEntry[linkEntry.id] = linkEntry;

          const targetEntry: Entry = {
            id: targetEntryId,
            userId: target.userId,
            parentId: linkEntry.id,
            arrowId: target.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: null,
            targetId: null,
            shouldGetLinks: false,
            isDeleted: false,
            bonusText: targetBonus,
          };

          idToEntry[targetEntry.id] = targetEntry;
        }
      })

      entryIds.push(sourceEntry.id);
    });
      

    dispatch(mergeEntries(idToEntry));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds,
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH)

  }

  return (
    <div onMouseMove={handleMouseMove} style={{
      position: 'absolute',
      left: 0,
      top: 0,
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 10,
      }}>
        <IonCard color={isValid ? 'light' : 'danger'} style={{
          margin: 10,
          padding: 10,
          display: 'flex',
        }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {
                user?.verifyEmailDate
                  ? <IonAvatar
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 4,
                        display: 'inline-block',
                        border: `1px solid ${user.color}`
                      }}
                    >
                      <img src={`https://www.gravatar.com/avatar/${md5(user?.email)}?d=retro`}/>
                    </IonAvatar>
                  : null
              }
            </div>
            <div>
              <span  style={{
                color: user?.color,
              }}>
                {user?.name}
              </span>
              <br/>
              { 
                user?.balance !== undefined
                  ? user.balance.toLocaleString() + ' points'
                  : null
              }
            </div>
            <div style={{
              marginRight: -5,
            }}>
              <IonButtons>
                {
                  alerts.length > 0
                    ? <IonButton onClick={handleAlertsClick}>
                        <IonBadge color={'dark'} style={{
                          fontSize: 10,
                        }}>
                          {alerts.length}
                        </IonBadge>
                      </IonButton>
                    : <IonButton onClick={handleGetAlertsClick}>
                        <IonIcon icon={reloadOutline} style={{
                          fontSize: 12
                        }}/>
                      </IonButton>
                }
              </IonButtons>
            </div>
        </IonCard>
      </div>
    </div>
  );

}
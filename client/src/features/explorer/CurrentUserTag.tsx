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
import { AlertReason } from "../alerts/alert";
import { selectIdToArrow, } from "../arrow/arrowSlice";
import { mergeEntries } from "../entry/entrySlice";
import { searchPushSlice } from "../search/searchSlice";
import useAlertsSub from "../alerts/useAlertsSub";
import { ellipsisHorizontal, reloadOutline } from "ionicons/icons";
import Quests from "../quests/Quests";
import useGetArrows from "../arrow/useGetArrows";
import useSetUserCheckAlertsDate from "../user/useSetUserCheckAlertsDate";
import { mapAlertToEntry } from "../entry/mapAlertToEntry";

export default function CurrentUserTag() {
  const dispatch = useAppDispatch();

  const { user, setMenuMode } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);

  useAlertsSub();

  const isValid = useAppSelector(selectAuthIsValid);

  const idToArrow = useAppSelector(selectIdToArrow);
  const idToAlert = useAppSelector(selectIdToAlert);

  const alerts = user 
    ? Object.values(idToAlert)
        .filter(alert => 
          !!alert.id && 
          !alert.deleteDate && 
          alert.createDate > user.checkAlertsDate &&
          alert.reason !== AlertReason.FEED
        )
        .sort((a, b) => a.createDate < b.createDate ? -1 : 1)
    : [];


  const { getAlerts } = useGetAlerts();
  const { getArrows } = useGetArrows();

  const { setUserCheckAlertsDate } = useSetUserCheckAlertsDate();

  useEffect(() => {
    if (!user?.id) return;
    getAlerts();
  }, [user?.id]);

  const handleGetAlertsClick = () => {
    getAlerts();
  };

  const handleDisplayAlertsClick = () => {
    const arrowIds: string[] = [];
    alerts.forEach(alert => {
      if (alert.sourceId) {
        arrowIds.push(alert.sourceId);
      }
      if (alert.linkId) {
        arrowIds.push(alert.linkId);
      }
      if (alert.targetId) {
        arrowIds.push(alert.targetId);
      }
    });

    getArrows(arrowIds);
    setUserCheckAlertsDate();

    const { idToEntry, entryIds } = mapAlertToEntry(user, idToArrow, alerts)

    dispatch(mergeEntries(idToEntry));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds,
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH)

  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div onMouseMove={handleMouseMove} style={{
      display: user ? 'flex' : 'none',
      position: 'absolute',
      left: 0,
      top: 0,
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 10,
      }}>
        <IonCard color={isValid ? undefined : 'danger'} style={{
          position: 'absolute',
          left: 0,
          top: 0,
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
            <div style={{
              whiteSpace: 'nowrap',
            }}>
              <span  style={{
                color: user?.color,
                whiteSpace: 'nowrap',
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
                    ? <IonButton onClick={handleDisplayAlertsClick}>
                        <IonBadge color={'dark'} style={{
                          fontSize: 10,
                        }}>
                          {alerts.length}
                        </IonBadge>
                      </IonButton>
                    : <IonButton onClick={handleGetAlertsClick}>
                        <IonIcon icon={ellipsisHorizontal} style={{
                          fontSize: 20,
                        }}/>
                      </IonButton>
                }
              </IonButtons>
            </div>
        </IonCard>
        <Quests />
      </div>
    </div>
  );

}
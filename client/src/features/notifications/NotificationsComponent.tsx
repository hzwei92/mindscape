import { gql } from "@apollo/client";
import { IonCard, IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";
import md5 from "md5";
import { useContext, useEffect } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { OFF_WHITE } from "../../constants";
import { getTimeString } from "../../utils";
import { selectIdToAlert } from "../alerts/alertSlice";
import useGetAlerts from "../alerts/useGetAlerts";
import ArrowComponent from "../arrow/ArrowComponent";
import { selectIdToLead, selectLeaderIdToLeadId, selectFollowerIdToLeadId } from "../lead/leadSlice";
import useGetUserLeads from "../lead/useGetUserLeads";
import { selectIdToUser } from "../user/userSlice";
import UserTag from "../user/UserTag";


export default function NotificationsComponent() {
  const { user, palette, setSelectedUserId } = useContext(AppContext);

  const idToAlerts = useAppSelector(selectIdToAlert);
  const alerts = Object.values(idToAlerts)
    .filter(alert => !!alert && !alert.deleteDate)
    .sort((a, b) => a.createDate < b.createDate ? 1 : -1);

  const { getAlerts } = useGetAlerts();

  useEffect(() => {
    getAlerts();
  }, []);

  return (
    <IonCard style={{
      margin: 0,
      borderRadius: 0,
      backgroundColor: palette === 'dark'
        ? '#000000'
        : OFF_WHITE,
      height: '100%',
      overflowY: 'scroll',
    }}>
      <IonCardHeader style={{
        padding: 10,
      }}>
        NOTIFICATIONS
      </IonCardHeader>
        {
          alerts.map(alert => {
            console.log(alert);
            return (
              <IonCard style={{
                marginTop: 0,
                padding: 5,
              }}>
                {
                  alert.arrowId && (
                    <ArrowComponent 
                      arrowId={alert.arrowId}
                      instanceId={alert.id}
                      fontSize={14}
                      tagFontSize={14}
                    />
                  )
                }
                <div style={{
                  marginTop: 5,
                  marginLeft: 15,
                }}>
                  {
                    alert.leadId && (
                      <div>
                        Written by a user you follow.
                      </div>
                    )
                  }
                  {
                    alert.roleId && (
                      <div>
                        Linked out from a post you subscribe to.
                      </div>
                    )
                  }
                  {
                    alert.abstractRoleId && (
                      <div>
                        Posted within a graph you subscribe to.
                      </div>
                    )
                  }
                    
                </div>
              </IonCard>
            )
          })
        }
    </IonCard>
  );
}
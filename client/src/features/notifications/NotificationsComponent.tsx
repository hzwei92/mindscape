import { gql } from "@apollo/client";
import { IonCard, IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";
import md5 from "md5";
import { useContext, useEffect } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { OFF_WHITE } from "../../constants";
import { getTimeString } from "../../utils";
import { selectIdToLead, selectLeaderIdToLeadId, selectFollowerIdToLeadId } from "../lead/leadSlice";
import useGetUserLeads from "../lead/useGetUserLeads";
import { selectIdToUser } from "../user/userSlice";
import UserTag from "../user/UserTag";


export default function NotificationsComponent() {
  const { user, palette, setSelectedUserId } = useContext(AppContext);


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
      <IonCard style={{
        marginTop: 0,
      }}>
      </IonCard>
    </IonCard>
  );
}
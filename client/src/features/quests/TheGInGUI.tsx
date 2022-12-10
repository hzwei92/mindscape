import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from "@ionic/react";
import { Dispatch, SetStateAction, useContext } from "react";
import { AppContext } from "../../app/App";
import { QUEST_WIDTH } from "../../constants";

export default function TheGInGUI() {
  const { user } = useContext(AppContext);

  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        To be continued...
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        More to follow on INs and OUTs, tabs, and more.
      </IonCardContent>
    </div>
  )
}
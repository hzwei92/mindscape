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
        fontSize: 12,
      }}>
        Click on a user's name to display a list of their tabs.
        <br/><br/>
        More to follow on INs and OUTs, tabs, COPY/PASTE, and more.
      </IonCardContent>
    </div>
  )
}
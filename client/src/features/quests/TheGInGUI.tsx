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
        The G in GUI
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Each graph has a root post that identifies it.
        <br/><br/>
        
        <br/>
        <br/>
        Hint: Use the REPLY button in the bottom left of each post.
      </IonCardContent>
    </div>
  )
}
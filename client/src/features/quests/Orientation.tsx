import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Orientation() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Orientation
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Mindscape is a platform. 
        <br/>
        Use it as a tool for whatever purpose.
        <br/><br/>

        <br/>
        <br/>
        Hint: Use the + button in the top left.
      </IonCardContent>
    </div>
  )
}
import { IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
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
        1. Orientation
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Here is an interactive tutorial for using the
        Mindscape platform. 
        <br/>
        <br/>
        Pan the view by dragging the screen.
        Zoom by pinch or scroll.
        Don't zoom out too far unless your device has the memory for it.
        <br/>
        <br/>
        Use the buttons at the bottom of the space to 
        recenter the view and to scan through posts chronologically.
        <br/>
        <br/>
        <b>Click</b> the <IonIcon icon={informationCircleOutline } size='small'/> icon in the app bar on the left to 
        quickly skim the prologue to our story.
        <br/><br/>
        Hint: Completing the <b>bolded</b> instructions will move you to the next step of the tutorial.
      </IonCardContent>
    </div>
  )
}
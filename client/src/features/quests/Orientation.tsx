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
        Orientation
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Here are some quick tips for using the
        Mindscape platform. 
        <br/>
        <br/>
        You can pan and zoom the view, but don't zoom out too far unless your device has enough memory.
        <br/>
        <br/>
        Use the buttons at the bottom of the space to 
        recenter the view and to scan through posts chronologically.
        <br/>
        <br/>
        <b>Click</b> the <IonIcon icon={informationCircleOutline } size='small'/> icon in the app bar on the left to 
        quickly skim the prologue to our story.
        <br/><br/>
        Hint: Completing the <b>bolded</b> instructions will advance the slide.
      </IonCardContent>
    </div>
  )
}
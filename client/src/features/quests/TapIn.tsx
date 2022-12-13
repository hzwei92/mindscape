import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function TapIn() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Tap in
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        A graph starts off with just a root post.
        That's what you see floating here.
        <br/>
        <br/>
        This graph is for your profile, so let's start by typing
        your <b>current status</b> in the root post.
        <br/>
        <br/>
        Hint: The text gets saved automatically.
        The app will alert you if there are connection issues.
      </IonCardContent>
    </div>
  )
}
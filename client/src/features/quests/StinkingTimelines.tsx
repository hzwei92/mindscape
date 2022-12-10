import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function StinkingTimelines() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Timelines?!
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        We don't need no stinking timelines!
        <br/><br/>
        The nav butons at the bottom of the page
        allow you to scan through a graph chronologically,
        based on when the posts were created.
        <br/>
        <br/>
        Try playing around with the nav buttons.
        <br/>
        <br/>
        Hint: links are skipped over unless they are opened.
      </IonCardContent>
    </div>
  )
}
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function TabulaRasa2() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Tabula rasa 2
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Now we could use some more blank slates!
        Let's extend the graph a bit to see how that works.
        <br/><br/>
        Hit <b>REPLY</b> on the root post.
        <br/><br/>
        Hint: There is a REPLY button in the bottom left of each post.
        <br/>
      </IonCardContent>
    </div>
  )
}
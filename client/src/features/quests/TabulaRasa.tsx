import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function TabulaRasa() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Tabula rasa
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        A fresh start.
        <br/><br/>
        Let's take a moment to appreciate the thin slice of joy
        that comes with a new beginnning.
        <br/><br/>
        Cool. Now, let's get you set up with a profile.
        <br/><br/>
        Open a <b>new tab</b> to create an empty graph.
        <br/>
        <br/>
        Hint: Use the + button in the top left.
      </IonCardContent>
    </div>
  )
}
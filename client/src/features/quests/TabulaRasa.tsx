import { IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
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
        4. Tabula rasa
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
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
        Hint: Use the <IonIcon icon={add} size='small'/>  button in the top left of the tab bar.
      </IonCardContent>
    </div>
  )
}
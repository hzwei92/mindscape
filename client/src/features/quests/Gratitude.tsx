import { IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { add, remove } from "ionicons/icons";
import { QUEST_WIDTH } from "../../constants";

export default function Gratitude() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        7. Gratitude
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Let's take a moment to focus on the things we're grateful for.
        <br/><br/>
        Thank you for trying out the app!
        <br/><br/>
        <b>Write</b> a bit in this new post
        about something interesting that you appreciate.
        Gratitude journal, maybe?
        <br/><br/>
        <b>Toggle</b> the font size of the post by clicking
        the <IonIcon icon={remove } size='small'/> or <IonIcon icon={add } size='small'/> button
        in the top right of the post in its color bar.
        <br/><br/>
        Hint: Posts have large font by default.
      </IonCardContent>
    </div>
  )
}
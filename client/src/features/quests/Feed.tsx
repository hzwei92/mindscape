import { IonCardContent, IonCardHeader, IonIcon } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import { QUEST_WIDTH } from "../../constants";

export default function Feed() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        12. What's poppin?
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        <b>Click</b> the <IonIcon icon={ellipsisHorizontal } size='small'/> button 
        on the right side of the name card above.
        This loads any notifications you might have.
        If you have no notifiactions, 
        then it will show a feed of the app's latest activity.
      </IonCardContent>
    </div>
  )
}
import { IonCardContent, IonCardHeader } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { QUEST_WIDTH } from "../../constants";

export default function Feed() {
  const { user } = useContext(AppContext);

  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Reload
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        <b>Click</b> the reload button on the right side of the name card.
        This loads any notifications you might have.
        If you have no notifiactions, 
        then it will show a feed of the app's latest activity.
      </IonCardContent>
    </div>
  )
}
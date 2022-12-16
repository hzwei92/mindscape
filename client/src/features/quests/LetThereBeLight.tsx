import { IonCardContent, IonCardHeader } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { QUEST_WIDTH } from "../../constants";


export default function LetThereBeLight() {
  const { user } = useContext(AppContext);

  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        2. And then there was light/dark mode...
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        In the beginning, there was only one color palette.
        Then, there were two.
        <br/><br/>
        Toggle <b>day/night mode</b>.
        <br/>
        <br/>
        Hint: Use the button in the bottom left of the app bar.
      </IonCardContent>
    </div>
  )
}
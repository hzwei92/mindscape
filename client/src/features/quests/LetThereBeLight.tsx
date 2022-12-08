import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from "@ionic/react";
import { Dispatch, SetStateAction, useContext } from "react";
import { AppContext } from "../../app/App";
import { QUEST_WIDTH } from "../../constants";

interface LetThereBeLightProps {
  isOpen: boolean;
  handleClose: () => void;
}
export default function LetThereBeLight(props: LetThereBeLightProps) {
  const { user } = useContext(AppContext);

  return (
    <IonCard style={{
      margin: 5,
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        And then there was light/dark mode...
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        In the beginning there was only one color palette.
        Now there are two.
        <br/><br/>
        Toggle day/night mode.
        <br/>
        <br/>
        Hint: Use the button in the bottom left.
        <IonButtons style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <IonButton onClick={props.handleClose}>
            OK
          </IonButton>
        </IonButtons>
      </IonCardContent>
    </IonCard>
  )
}
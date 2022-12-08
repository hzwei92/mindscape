import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from "@ionic/react";
import { Dispatch, SetStateAction, useContext } from "react";
import { AppContext } from "../../app/App";

interface GuiProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}
export default function Gui(props: GuiProps) {
  const { user } = useContext(AppContext);

  return (
    <IonModal isOpen={props.isOpen} onWillDismiss={() => props.setIsOpen(false)}>
      <IonCard style={{
        height: '100%',
        margin: 0,
        padding: 10,
      }}>
        <IonCardHeader style={{
          fontSize: 80,
          textAlign: 'center',
        }}>
          Put the G in GUI
        </IonCardHeader>
        <IonCardContent style={{
          textAlign: 'center',
          flexDirection: 'column',
        }}>
          Each graph has a root post that identifies it.
          <br/><br/>
          
          <br/>
          <br/>
          Hint: Use the REPLY button in the bottom left of each post.
          <IonButtons style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <IonButton onClick={() => props.setIsOpen(false)}>
              OK
            </IonButton>
          </IonButtons>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}
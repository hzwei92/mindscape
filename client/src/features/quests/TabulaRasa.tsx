import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";

interface TabulaRasaProps {
  isOpen: boolean;
  handleClose: () => void;
}
export default function TabulaRasa(props: TabulaRasaProps) {
  return (
    <IonCard style={{
      margin: 5,
      width: 280,
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
        Open a new tab to create your first graph.
        <br/>
        <br/>
        Hint: Use the + button in the top left.
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
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";


interface TabulaRasa2Props {
  isOpen: boolean;
  handleClose: () => void;
}
export default function TabulaRasa2(props: TabulaRasa2Props) {
  return (
    <IonCard style={{
      margin: 5,
      width: 280,
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
        A graph starts off with just a root post.
        <br/>
        You can type in it, if you like. 
        <br/>
        Then you might need more blank slates!
        <br/>
        <br/>
        So let's extend the graph a bit to see how that works.
        <br/><br/>
        Hit reply a few times.
        <br/><br/>
        Hint: Each post has a REPLY button in its bottom left.
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
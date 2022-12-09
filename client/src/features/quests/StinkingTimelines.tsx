import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";

interface StinkingTimelinesProps {
  isOpen: boolean;
  handleClose: () => void;
}
export default function StinkingTimelines(props: StinkingTimelinesProps) {
  return (
    <IonCard style={{
      margin: 5,
      width: 280,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Timelines?!
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        We don't need no stinking timelines!
        <br/><br/>
        The nav butons at the bottom of the page
        allow you to scan through a graph chronologically,
        based on when the posts were created.
        <br/>
        <br/>
        Try playing around with the nav buttons.
        <br/>
        <br/>
        Hint: links are skipped over unless they are opened.
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
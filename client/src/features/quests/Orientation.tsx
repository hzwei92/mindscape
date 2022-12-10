import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Orientation() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Orientation
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Here are some quick tips for using the
        Mindscape platform. 
        <br/>
        <br/>
        Notice you can pan and zoom the view.
        <br/>
        <br/>
        Use the buttons at the bottom of the space to 
        recenter the view and scroll through the posts
        chronologically based on when they were created.
        <br/>
        <br/>
        <b>Click</b> the info circle in the app bar on the left to 
        quickly skim the prologue to our story.
      </IonCardContent>
    </div>
  )
}
import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function OnReply() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        On REPLY
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        A post is an identity arrow; it loops around to point back at itself.
        A link is an arrow that connects two other different arrows.
        <br/><br/>
        When you use REPLY on an arrow, you create a post and a link.
        <br/><br/>

      </IonCardContent>
    </div>
  )
}
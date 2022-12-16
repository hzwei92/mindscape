import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Arrows() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        9. Everything is made of arrows
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        A post is an arrow that loops around to point back at itself.
        <br/><br/>
        A link is an arrow that connects two other different arrows.
        <br/><br/>
        This means that links are real objects like posts.
        Links have their own content,
        and you can reply to them and link between them.
        <br/><br/>
        <b>Click</b> on a link to check out the resemblence between posts and links.
        <br/><br/>
        Hint: When a link is minimized, it displays the number of upvotes it has.
      </IonCardContent>
    </div>
  )
}
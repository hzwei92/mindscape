import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Twigs() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        10. A tree of twigs
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Every time you use REPLY in a graph, it generates a post, a link, and a twig.
        <br/><br/>
        Each twig is rendered in the view as a solid line between two arrows.
        Twigs define the tree shaped layout of posts in a graph.
        <br/><br/>
        <b>Drag</b> one post on top of another
        to make the dragged post the child of the target post,
        thus grafting it into a different spot in the tree.
        <br/><br/>
        Hint: On mobile, you want to drag the post's top left corner to be over the target.
        <br/><br/>
        Hint: If you drag a post onto its current parent, nothing happens.
      </IonCardContent>
    </div>
  )
}
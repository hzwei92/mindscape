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
        A tree of twigs
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Every time you use REPLY in a graph, it generates a post, a link, and a twig.
        <br/><br/>
        The twig is visualized as a solid line between two arrows.
        Twigs define the tree shaped layout of posts in a graph.
        <br/><br/>
        <b>Drag</b> one post on top of another to graft it into a different spot in the tree.
        <br/><br/>
        Hint: On mobile, you want drag the post's top left corner to be over the target.
        <br/><br/>
        Hint: If you drag a post onto its current parent, nothing happens.
      </IonCardContent>
    </div>
  )
}
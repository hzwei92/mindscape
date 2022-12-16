import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Service() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        8. Valar dohaeris
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Let's help you connect with people
        who have skills and interests that complement 
        your own.
        <br/><br/>
        <b>Reply</b> with a new post or two.
        <br/><br/>
        What do you do well? 
        <br/>
        What do you love doing?
        <br/>
        What do you need help with?
        <br/><br/>
        <b>Drag</b> the posts around to feng shui the graph.
        <br/><br/>
        Hint: The colored bar at the top of each post is a handle for dragging it.
        <br/><br/>
        Hint: The root post doesn't move.
      </IonCardContent>
    </div>
  )
}
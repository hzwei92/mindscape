import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function InsAndOuts() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        3. The INs and OUTs
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Every graph is just a slice of the whole network of data.
        <br/><br/>
        To see what lies underneath the surface, you can 
        follow links to other posts and graphs.
        <br/><br/>
        Click the <b>OUTs</b> button on a post to see the links
        pointing out from it.
        <br/><br/>
        Hint: There is an OUTs button in the bottom of every post.
      </IonCardContent>
    </div>
  )
}
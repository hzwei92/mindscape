import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Gratitude() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Gratitude
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Let's take a moment to focus on the things we're grateful for.
        <br/><br/>
        Thank you for trying out the app!
        <br/><br/>
        <b>Write</b> a bit in this new post
        about something interesting that you appreciate.
        Maybe you could use this to start a gratitude journal!
        <br/><br/>
        <b>Toggle</b> the font size of a post using the -/+ button around the top right of the post.
      </IonCardContent>
    </div>
  )
}
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
      }}>
        Let's take a moment to focus on the things we're grateful for.
        <br/><br/>
        Thank you for trying this app!
        <br/><br/>
        <b>Write</b> a bit in this new post
        about something interesting that you appreciate having in your life.
        <br/><br/>
        <b>Toggle</b> the font size of a post using the -/+ button around the top right of the post.
      </IonCardContent>
    </div>
  )
}
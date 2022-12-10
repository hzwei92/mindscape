import { IonCardContent, IonCardHeader } from "@ionic/react";
import { QUEST_WIDTH } from "../../constants";

export default function Nesting() {
  return (
    <div style={{
      width: QUEST_WIDTH,
    }}>
      <IonCardHeader style={{
        fontSize: 40,
        textAlign: 'center',
      }}>
        Arrows all the way down
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
      }}>
        Each arrow can be the root of its own graph.
        The root of a graph is kind of like a folder that holds the graph inside of it.
        <br/><br/>
        Hit the <b>OPEN</b> button on an arrow to set it as the root of a new graph.
        <br/><br/>
        Hint: if an arrow is the root of a graph, it will display a title underlined and in bold.
        You can click this title to open the graph in a new tab.
      </IonCardContent>
    </div>
  )
}
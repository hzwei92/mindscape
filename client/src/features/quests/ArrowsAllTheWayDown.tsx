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
        11. Arrows all the way down
      </IonCardHeader>
      <IonCardContent style={{
        textAlign: 'center',
        flexDirection: 'column',
        fontSize: 12,
      }}>
        Each arrow can be the root of its own graph.
        The root of a graph is kind of like a folder that holds the graph inside.
        <br/><br/>
        If an arrow is the root of a graph, it will display the graph title underlined, in bold.
        You can click this title to open the graph in a new tab.
        <br/><br/>
        Use the <b>OPEN</b> button on one of your arrows to open a new graph inside the arrow.
        <br/><br/>
        Hint: The OPEN button keeps track of how many twigs have been created inside the arrow.
      </IonCardContent>
    </div>
  )
}
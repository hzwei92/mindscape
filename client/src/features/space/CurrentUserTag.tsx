import { IonCard } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import UserTag from "../user/UserTag";
import { SpaceContext } from "./SpaceComponent";


export default function CurrentUserTag() {
  const { user } = useContext(AppContext);
  const { abstractId, abstract, canEdit } = useContext(SpaceContext);

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }
  return (
    <div onMouseMove={handleMouseMove} style={{
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 10,
      }}>
        <IonCard color='light' style={{
          padding: 10,
        }}>
          <UserTag user={user} fontSize={20} />
        </IonCard>
      </div>
    </div>
  );

}
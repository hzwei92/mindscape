import { IonCard } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { selectAuthIsValid } from "../auth/authSlice";
import UserTag from "../user/UserTag";
import { SpaceContext } from "./SpaceComponent";


export default function CurrentUserTag() {
  const { user } = useContext(AppContext);
  const { abstractId, abstract, canEdit } = useContext(SpaceContext);

  const isValid = useAppSelector(selectAuthIsValid);

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }
  return (
    <div onMouseMove={handleMouseMove} style={{
      position: 'absolute',
      left: 0,
      top: 0,
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 10,
      }}>
        <IonCard color={isValid ? 'light' : 'danger'} style={{
          margin: 10,
          padding: 10,
        }}>
          <UserTag user={user} fontSize={16} />
        </IonCard>
      </div>
    </div>
  );

}
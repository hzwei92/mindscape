import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonFab, IonFabButton, IonIcon, IonModal } from "@ionic/react";
import { alert } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/App";
import Gui from "./GUI";
import LetThereBeLight from "./LetThereBeLight";
import StinkingTimelines from "./StinkingTimelines";
import TabulaRasa from "./TabulaRasa";
import TabulaRasa2 from "./TabulaRasa2";


export default function Quests() {
  const { user, palette } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [hilight, setHilight] = useState(true);
  const [hilightInterval, setHilightInterval] = useState<ReturnType<typeof setInterval>>();
  
  useEffect(() => {
    if (!user?.createGraphDate) {
      const i = setInterval(() => {
        setHilight(val => !val);
      }, 500)
      setHilightInterval(i);
      return () => {
        clearInterval(i);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    setHilight(true);
  }, [
    user?.createGraphDate, 
    (user?.replyN ?? 0) > 2, 
    user?.navigateGraphDate,
    user?.togglePaletteDate
  ])

  useEffect(() => {
    if (isOpen) {
      clearInterval(hilightInterval);
    }
  }, [isOpen])

  const handleClose = () => {
    setHilight(false);
    setIsOpen(false);
  }

  if (!user) return null;

  if (
    user.createGraphDate && 
    user.replyN > 2 && 
    user.navigateGraphDate &&
    user.togglePaletteDate
  ) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 65,
      left: 5,
    }}>
      <IonFab style={{
        display: isOpen
          ? 'none'
          : 'block',
      }}>
        <IonFabButton size='small' color={hilight ? 'dark' : 'secondary'} onClick={() => setIsOpen(true)}>
          <IonIcon icon={alert} size='small'/>
        </IonFabButton>
      </IonFab>
      <div style={{
        display: isOpen
          ? 'block'
          : 'none',
        paddingTop: 3,
      }}>
        {
          !user?.createGraphDate
            ? <TabulaRasa isOpen={isOpen} handleClose={handleClose} />
            : user.replyN < 3
              ? <TabulaRasa2 isOpen={isOpen} handleClose={handleClose} />
              : !user?.navigateGraphDate
                ? <StinkingTimelines isOpen={isOpen} handleClose={handleClose} />
                : !user?.togglePaletteDate
                  ? <LetThereBeLight isOpen={isOpen} handleClose={handleClose} />
                  : null
        }
      </div>
    </div>
  )
}
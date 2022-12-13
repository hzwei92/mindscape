import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonFab, IonFabButton, IonIcon, IonModal } from "@ionic/react";
import { alert, arrowBack, arrowForward } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/App";
import LetThereBeLight from "./LetThereBeLight";
import TabulaRasa from "./TabulaRasa";
import TapIn from "./TapIn";
import TheGInGUI from "./TheGInGUI";
import Gratitude from "./Gratitude";
import TabulaRasa2 from "./TabulaRasa2";
import { User } from "../user/user";
import Service from "./Service";
import Arrows from "./Arrows";
import Twigs from "./Twigs";
import ArrowsAllTheWayDown from "./ArrowsAllTheWayDown";
import Orientation from "./Orientation";
import { MenuMode } from "../menu/menu";
import useSetUserViewInfoDate from "../user/useSetUserViewInfoDate";
import Feed from "./Feed";
import InsAndOuts from "./InsAndOuts";


export default function Quests() {
  const { user, menuMode } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [hilight, setHilight] = useState(true);
  const [hilightInterval, setHilightInterval] = useState<ReturnType<typeof setInterval>>();

  const { setUserViewInfoDate } = useSetUserViewInfoDate();

  useEffect(() => {
    if (menuMode === MenuMode.ABOUT && !user?.viewInfoDate) {
      setUserViewInfoDate();
    }
  }, [menuMode]);
  useEffect(() => {
    setIsOpen(false);
    if (hilightInterval) {
      clearInterval(hilightInterval);
    }
    if (!user?.togglePaletteDate) {
      const i = setInterval(() => {
        setHilight(val => !val);
      }, 500)
      setHilightInterval(i);
      return () => {
        clearInterval(i);
      }
    }
  }, [user?.id]);


  const [index, setIndex] = useState(-1);

  const questList: JSX.Element[] = [
    <Orientation />,
    <LetThereBeLight />,
    <InsAndOuts />,
    <TabulaRasa />,
    <TapIn />,
    <TabulaRasa2 />,
    <Gratitude />,
    <Service />,
    <Arrows />,
    <Twigs />,
    <ArrowsAllTheWayDown />,
    <Feed />,
    <TheGInGUI />,
  ]

  const resetIndex = (user: User | null) => {
    console.log('hello')
    if (!user?.viewInfoDate) {
      setIndex(0);
    }
    else if (!user?.togglePaletteDate) {
      setIndex(1);
    }
    else if (!user?.loadOutsDate) {
      setIndex(2);
    }
    else if (!user.createGraphDate) {
      setIndex(3);
    }
    else if (!user.saveArrowDate){
      setIndex(4);
    }
    else if (!user.firstReplyDate) {
      setIndex(5);
    }
    else if (!user.openPostDate) {
      setIndex(6);
    }
    else if (!user.moveTwigDate) {
      setIndex(7);
    }
    else if (!user.openLinkDate){
      setIndex(8);
    }
    else if (!user.graftTwigDate) {
      setIndex(9);
    }
    else if (!user.openArrowDate) {
      setIndex(10);
    }
    else if (!user.loadFeedDate) {
      setIndex(11);
    }
    else {
      setIndex(12);
    }
  }

  useEffect(() => {
    setHilight(true);
    resetIndex(user);
  }, [
    user?.id, 
    user?.viewInfoDate,
    user?.togglePaletteDate,
    user?.loadOutsDate,
    user?.createGraphDate,
    user?.saveArrowDate,
    user?.firstReplyDate, 
    user?.openPostDate,
    user?.moveTwigDate,
    user?.openLinkDate,
    user?.graftTwigDate,
    user?.openArrowDate,
    user?.checkAlertsDate,
    user?.loadFeedDate,
  ]);

  useEffect(() => {
    if (isOpen) {
      clearInterval(hilightInterval);
    }
  }, [isOpen])

  const handleClose = () => {
    setHilight(false);
    setIsOpen(false);
    resetIndex(user);
  }

  if (!user) return null;
  if (!questList[index]) return null;

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
        <IonCard style={{
          margin: 5,
        }}>
        {
          questList[index]
        }
        <IonButtons style={{
          marginBottom: 10,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <IonButton disabled={index <= 0} onClick={() => setIndex(val => val - 1)}>
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonButton onClick={handleClose}>
            OK
          </IonButton>
          <IonButton disabled={index >= questList.length - 1} onClick={() => setIndex(val => val + 1)}>
            <IonIcon icon={arrowForward}/>
          </IonButton>
        </IonButtons>
        </IonCard>
      </div>
    </div>
  )
}
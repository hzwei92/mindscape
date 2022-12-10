import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonFab, IonFabButton, IonIcon, IonModal } from "@ionic/react";
import { alert, arrowBack, arrowForward } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/App";
import LetThereBeLight from "./LetThereBeLight";
import StinkingTimelines from "./StinkingTimelines";
import TabulaRasa from "./TabulaRasa";
import TapIn from "./TapIn";
import TheGInGUI from "./TheGInGUI";
import Gratitude from "./Gratitude";
import TabulaRasa2 from "./TabulaRasa2";
import { User } from "../user/user";
import Service from "./Service";
import { IdToType } from "../../types";
import Arrows from "./Arrows";
import OnReply from "./OnReply";
import Twigs from "./Twigs";
import ArrowsAllTheWayDown from "./ArrowsAllTheWayDown";


export default function Quests() {
  const { user, palette } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [hilight, setHilight] = useState(true);
  const [hilightInterval, setHilightInterval] = useState<ReturnType<typeof setInterval>>();

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

  const quests: IdToType<JSX.Element> = {
    arrows: <Arrows />,
    gratitude: <Gratitude />,
    gui: <TheGInGUI  />,
    light: <LetThereBeLight />,
    reply: <OnReply />,
    service: <Service />,
    tabula: <TabulaRasa />,
    tabula2: <TabulaRasa2  />,
    tapIn: <TapIn  />,
    timelines: <StinkingTimelines  />,
    twigs: <Twigs />,
  }
  const questList: JSX.Element[] = [
    <LetThereBeLight />,
    <TabulaRasa />,
    <TapIn />,
    <TabulaRasa2 />,
    <Gratitude />,
    <Service />,
    <Arrows />,
    <Twigs />,
    <ArrowsAllTheWayDown />,
  ]

  const resetIndex = (user: User | null) => {
    console.log('hello')
    if (!user?.togglePaletteDate) {
      setIndex(0);
    }
    else if (!user.createGraphDate) {
      setIndex(1);
    }
    else if (!user.saveArrowDate){
      setIndex(2);
    }
    else if (!user.firstReplyDate) {
      setIndex(3);
    }
    else if (!user.openPostDate) {
      setIndex(4);
    }
    else if (!user.moveTwigDate) {
      setIndex(5);
    }
    else if (!user.openLinkDate){
      setIndex(6);
    }
    else if (!user.graftTwigDate) {
      setIndex(7);
    }
    else if (!user.openArrowDate) {
      setIndex(8);
    }
    else {
      setIndex(9);
    }
  }

  useEffect(() => {
    setHilight(true);
    resetIndex(user);
  }, [
    user?.id, 
    user?.togglePaletteDate,
    user?.createGraphDate,
    user?.saveArrowDate,
    user?.firstReplyDate, 
    user?.openPostDate,
    user?.moveTwigDate,
    user?.openLinkDate,
    user?.graftTwigDate,
  ])

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
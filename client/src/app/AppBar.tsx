import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonMenu, IonModal, IonPopover, IonToolbar, useIonRouter } from "@ionic/react";
import { add, menu, moon, personCircle, sunny } from "ionicons/icons";
import md5 from "md5";
import { useContext, useRef } from "react";
import { MAX_Z_INDEX } from "../constants";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import CreateGraphModal from "../features/arrow/CreateGraphModal";
import useSaveArrowSub from "../features/arrow/useSaveArrowSub";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useSetUserPalette from "../features/user/useSetUserPalette";
import { AppContext } from "./App";
import { useAppSelector } from "./store";
import useAppRouter from "./useAppRouter";


const AppBar = () => {
  useAppRouter();
  useSaveArrowSub();

  const { setUserPalette } = useSetUserPalette();

  const { user, palette, setIsCreatingGraph } = useContext(AppContext);

  const router = useIonRouter();

  const path = (router.routeInfo?.pathname || '').split('/');

  const idToTab = useAppSelector(selectIdToTab);
  const idToArrow = useAppSelector(selectIdToArrow);

  const focusTab = useAppSelector(selectFocusTab);

  const handlePaletteClick = () => {
    setUserPalette(user?.palette === 'dark' ? 'light' : 'dark');
  }
  const handleCreateGraphClick = () => {
    setIsCreatingGraph(true);
  }

  return (
    <div>
      <IonToolbar mode='md'>
        <IonButtons id='mainMenuButton' slot='start'>
          <IonButton id='mainMenuButton'>
            <IonIcon icon={menu} />
          </IonButton>
        </IonButtons>
        <IonPopover trigger='mainMenuButton' triggerAction='click' dismissOnSelect={true}>
          <IonList>
            <IonItem routerLink='/about'>
              ABOUT
            </IonItem>
            <IonItem routerLink='/search'>
              SEARCH
            </IonItem>
            <IonItem routerLink='/graphs'>
              GRAPHS
            </IonItem>
            <IonItem routerLink='/contacts'>
              CONTACTS
            </IonItem>
            <IonItem routerLink='/map'>
              MAP
            </IonItem>
            <IonItem routerLink='/feed'>
              FEED
            </IonItem>
          </IonList>
        </IonPopover>
        <IonButtons slot='end'>
          <IonButton onClick={handlePaletteClick}>
            {
              palette === 'dark'
                ? <IonIcon icon={moon} size='small'/>
                : <IonIcon icon={sunny} size='small'/>
            }
          </IonButton>
          {
            Object.values(idToTab)
            .filter(tab => !tab.deleteDate)
            .sort((a, b) => a.i - b.i)
            .map(tab => {
              const arrow = idToArrow[tab.arrowId];
              if (!arrow) return null;

              const isFocus = focusTab?.id === tab.id && path[1] === 'g' && path[2] === arrow?.routeName;
              
              return  (
                <IonButton key={'tab-'+tab.id} routerLink={isFocus ? '/about' : `/g/${arrow.routeName}`} style={{
                  border: isFocus
                    ? `1px solid ${arrow.color}`
                    : 'none',
                  borderRadius: 5,
                  color: arrow.color,
                }}>
                  { tab.i + 1 }
                </IonButton>
              );
            })
          }
          <IonButton onClick={handleCreateGraphClick}>
            <IonIcon icon={add} size='small'/>
          </IonButton>
          <IonButton id='userMenuButton'>
            {
              user?.verifyEmailDate
                ? <IonAvatar
                    style={{
                      display: 'inline-block',
                      marginBottom: '-2px',
                      marginRight: '4px',
                      width: 17,
                      height: 17,
                      border: `1px solid ${user.color}`
                    }}
                  >
                    <IonImg src={`https://www.gravatar.com/avatar/${md5(user.email)}?d=retro`}/>
                  </IonAvatar>
                : <IonIcon icon={personCircle} style={{
                    color: user?.color
                  }}/>
            }
          </IonButton>
        </IonButtons>
        <IonPopover trigger='userMenuButton' triggerAction='click' dismissOnSelect={true}>
          <IonHeader style={{
            padding: 10,
            color: user?.color
          }}>
            { user?.name }
          </IonHeader>
          <IonList>
            <IonItem routerLink='/account'>
              ACCOUNT
            </IonItem>
            <IonItem routerLink='/login'>
              LOGIN
            </IonItem>
            <IonItem routerLink='/logout'>
              LOGOUT
            </IonItem>
          </IonList>
        </IonPopover>
      </IonToolbar>
    </div>
  )
}

export default AppBar;
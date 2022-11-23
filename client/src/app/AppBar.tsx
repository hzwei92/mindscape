import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, IonImg, IonItem, IonList, IonPopover, IonToolbar, useIonRouter, isPlatform, getPlatforms } from "@ionic/react";
import { add, menu, moon, personCircle, sunny } from "ionicons/icons";
import md5 from "md5";
import { useContext } from "react";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import useLinkArrowsSub from "../features/arrow/useLinkArrowsSub";
import useSaveArrowSub from "../features/arrow/useSaveArrowSub";
import { MenuMode } from "../features/menu/menu";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useSetUserPalette from "../features/user/useSetUserPalette";
import { AppContext } from "./App";
import { useAppSelector } from "./store";
import useAppRouter from "./useAppRouter";


const AppBar = () => {
  //console.log('appbar', getPlatforms());
  useAppRouter();
  useSaveArrowSub();
  useLinkArrowsSub();

  const { setUserPalette } = useSetUserPalette();

  const { 
    user, 
    palette, 
    setIsCreatingGraph, 
    menuMode,
    setMenuMode,
  } = useContext(AppContext);

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

  const handleMenuClick = (mode: MenuMode) => () => {
    if (mode === menuMode) {
      setMenuMode(MenuMode.NONE);
    }
    else {
      setMenuMode(mode);
    }
  }

  return (
    <div style={{
      marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 25 : 0
    }}>
      <IonToolbar>
        {
          isPlatform('mobile')
            ? <IonButtons slot='start'>
                <IonButton id='mainMenuButton'>
                  <IonIcon icon={menu} />
                </IonButton>
              </IonButtons>
            : <IonButtons slot='start'>
                <IonButton onClick={handleMenuClick(MenuMode.ABOUT)} style={{
                  fontWeight: menuMode === MenuMode.ABOUT
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.ABOUT
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  ABOUT
                </IonButton>
                <IonButton onClick={handleMenuClick(MenuMode.SEARCH)} style={{
                  fontWeight: menuMode === MenuMode.SEARCH
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.SEARCH
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  SEARCH
                </IonButton>
                <IonButton onClick={handleMenuClick(MenuMode.GRAPHS)} style={{
                  fontWeight: menuMode === MenuMode.GRAPHS
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.GRAPHS
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  GRAPHS
                </IonButton>
                <IonButton onClick={handleMenuClick(MenuMode.CONTACTS)} style={{
                  fontWeight: menuMode === MenuMode.CONTACTS
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.CONTACTS
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  CONTACTS
                </IonButton>
                <IonButton onClick={handleMenuClick(MenuMode.MAP)} style={{
                  fontWeight: menuMode === MenuMode.MAP
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.MAP
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  MAP
                </IonButton>
                <IonButton onClick={handleMenuClick(MenuMode.FEED)} style={{
                  fontWeight: menuMode === MenuMode.FEED
                    ? 900
                    : 'normal',
                  color: menuMode === MenuMode.FEED
                    ? user?.color
                    : null,
                  fontSize: 12,
                }}>
                  FEED
                </IonButton>
              </IonButtons>
        }

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
                <IonButton key={'tab-'+tab.id} routerLink={`/g/${arrow.routeName}/0`} style={{
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
          <IonHeader>
            <div style={{
              padding: 10,
              color: user?.color
            }}>

              { user?.name }
            </div>
            <div style={{
              padding: 10,
            }}>
              { user?.balance } points
            </div>
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
import { IonButton, IonButtons,useIonRouter, IonCard, IonIcon, IonPopover } from "@ionic/react";
import { 
  chatboxOutline, 
  filterOutline, 
  globeOutline, 
  informationCircleOutline, 
  invertMode, 
  invertModeOutline, 
  mapOutline, 
  moonOutline, 
  notifications, 
  notificationsOutline, 
  peopleOutline, 
  personCircleOutline, 
  searchOutline, 
  sunnyOutline
} from "ionicons/icons";
import { useContext, useState } from "react";
import { MAX_Z_INDEX } from "../constants";
import useLinkArrowsSub from "../features/arrow/useLinkArrowsSub";
import useSaveArrowSub from "../features/arrow/useSaveArrowSub";
import useAuth from "../features/auth/useAuth";
import { MenuMode } from "../features/menu/menu";
import useSetUserPalette from "../features/user/useSetUserPalette";
import { AppContext } from "./App";
import useAppRouter from "./useAppRouter";

import icon from './favicon.png';
import { useAppSelector } from "./store";
import { selectFocusTab } from "../features/tab/tabSlice";

const AppBar = () => {
  const { setUserPalette } = useSetUserPalette();

  const { 
    user, 
    palette, 
    menuMode,
    setMenuMode,
  } = useContext(AppContext);

  useAppRouter();
  useAuth();
  useSaveArrowSub();
  useLinkArrowsSub();

  const [label, setLabel] = useState(MenuMode.NONE);

  const focusTab = useAppSelector(selectFocusTab);

  const handlePaletteClick = () => {
    setUserPalette(user?.palette === 'dark' ? 'light' : 'dark');
  }

  const handleMenuMouseEnter = (mode: MenuMode) => () => {
    setLabel(mode);
  }
  const handleMenuMouseLeave = () => {
    setLabel(MenuMode.NONE);
  }

  const handleMenuClick = (mode: MenuMode) => () => {
    if (mode === menuMode) {
      setMenuMode(MenuMode.NONE);
    }
    else {
      setMenuMode(mode);
    }
  }

  const handleAgreeClick = () => {

  }

  return (
    <IonCard style={{
      margin: 0,
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '100%',
      width: 50,
      overflow: 'visible',
    }}>
      <IonButtons style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        padding: 0,
      }}>
        <IonButton style={{
          height: 50,
          width: 50,
        }}>
          <img src={icon} style={{
            transform: 'scale(.85)',
          }}/>
        </IonButton>
        <div style={{
          left: 10,
          top: 10,
          position: 'absolute',
          width: 30,
          height: 30,
          backgroundColor: palette === 'dark'
            ? 'black'
            : 'lavender',
          display: focusTab?.id 
            ? 'none'
            : 'flex',
          zIndex: MAX_Z_INDEX,
          borderRadius: 25,
        }}/>
        <IonButton 
          onMouseEnter={handleMenuMouseEnter(MenuMode.ACCOUNT)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.ACCOUNT)}
          style={{
            width: 50,
            height: 50,
            borderLeft: menuMode === MenuMode.ACCOUNT
              ? `3px solid ${user?.color}`
              : null,

          }}
        >
          <IonIcon icon={personCircleOutline} style={{
            color: menuMode === MenuMode.ACCOUNT
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.ACCOUNT
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 45,
          padding: 10,
        }}>
          ACCOUNT
        </IonCard>
        <IonButton  
          onMouseEnter={handleMenuMouseEnter(MenuMode.SEARCH)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.SEARCH)}
          style={{
            width: 50,
            height: 50,
            borderLeft: menuMode === MenuMode.SEARCH
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={searchOutline} style={{
            color: menuMode === MenuMode.SEARCH
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.SEARCH
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 95,
          padding: 10,
        }}>
          SEARCH
        </IonCard>
        <IonButton 
          onMouseEnter={handleMenuMouseEnter(MenuMode.MAP)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.MAP)}
          style={{
            height: 50,
            width: 50,
            borderLeft: menuMode === MenuMode.MAP
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={mapOutline} style={{
            color: menuMode === MenuMode.MAP
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.MAP
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 145,
          padding: 10,
        }}>
          MAP
        </IonCard>
        <IonButton 
          onMouseEnter={handleMenuMouseEnter(MenuMode.CONTACTS)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.CONTACTS)}
          style={{
            height: 50,
            width: 50,
            borderLeft: menuMode === MenuMode.CONTACTS
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={peopleOutline} style={{
            color: menuMode === MenuMode.CONTACTS
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.CONTACTS
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 195,
          padding: 10,
        }}>
          CONTACTS
        </IonCard>

        <IonButton 
          id={'menu-info-button'}
          onMouseEnter={handleMenuMouseEnter(MenuMode.ABOUT)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.ABOUT)}
          style={{
            height: 50,
            width: 50,
            borderLeft: menuMode === MenuMode.ABOUT
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={informationCircleOutline} style={{
            color: menuMode === MenuMode.ABOUT
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.ABOUT
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 245,
          padding: 10,
        }}>
          ABOUT
        </IonCard>
      </IonButtons>
      <IonButtons style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        <IonButton onClick={handlePaletteClick} style={{
          height: 50,
          width: 50,
        }}>
          <IonIcon 
            icon={palette === 'dark' ? moonOutline : sunnyOutline} 
            style={{
              transform: palette === 'dark'
                ? 'scale(.75)'
                : null,
            }}
          />
        </IonButton>
      </IonButtons>
    </IonCard>
  )
}

export default AppBar;
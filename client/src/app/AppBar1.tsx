import { IonButton, IonButtons,useIonRouter, IonCard, IonIcon } from "@ionic/react";
import { 
  chatboxOutline, 
  filterOutline, 
  globeOutline, 
  informationCircleOutline, 
  mapOutline, 
  moonOutline, 
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
      }}>
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
          top: -5,
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
          top: 45,
          padding: 10,
        }}>
          SEARCH
        </IonCard>
        <IonButton 
          onMouseEnter={handleMenuMouseEnter(MenuMode.GRAPHS)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.GRAPHS)} 
          style={{
            width: 50,
            height: 50,
            borderLeft: menuMode === MenuMode.GRAPHS
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={globeOutline} style={{
            color: menuMode === MenuMode.GRAPHS
              ? user?.color
              : null,
          }}/>
        </IonButton>
        
        <IonCard style={{
          display: label === MenuMode.GRAPHS
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 95,
          padding: 10,
        }}>
          GRAPHS
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
          top: 145,
          padding: 10,
        }}>
          CONTACTS
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
          top: 195,
          padding: 10,
        }}>
          MAP
        </IonCard>
        <IonButton 
          onMouseEnter={handleMenuMouseEnter(MenuMode.FEED)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick(MenuMode.FEED)}
          style={{
            height: 50,
            width: 50,
            borderLeft: menuMode === MenuMode.FEED
              ? `3px solid ${user?.color}`
              : null,
          }}
        >
          <IonIcon icon={filterOutline} style={{
            color: menuMode === MenuMode.FEED
              ? user?.color
              : null,
          }}/>
        </IonButton>
        <IonCard style={{
          display: label === MenuMode.FEED
            ? 'block'
            : 'none',
          position: 'absolute',
          left: 45,
          top: 245,
          padding: 10,
        }}>
          FEED
        </IonCard>
        <IonButton 
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
          top: 295,
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
          {
            palette === 'dark'
              ? <IonIcon icon={moonOutline} size='small' style={{
                  color: user?.color
                }}/>
              : <IonIcon icon={sunnyOutline} size='large' style={{
                  color: user?.color
                }}/>
          }
        </IonButton>
      </IonButtons>
    </IonCard>
  )
}

export default AppBar;
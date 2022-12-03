import {
  IonApp,
  isPlatform,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import '../theme/variables.css';

import '../theme/base.css';

import { createContext, Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '../features/user/user';
import { useAppSelector } from './store';
import { selectCurrentUser, selectIdToUser } from '../features/user/userSlice';
import { MenuMode } from '../features/menu/menu';
import { APP_BAR_X, MENU_MIN_WIDTH, MENU_WIDTH, NOTCH_SIZE } from '../constants';
import AppBar from './AppBar';
import CreateGraphModal from '../features/arrow/CreateGraphModal';
import UserModal from '../features/user/UserModal';
import MenuComponent from '../features/menu/MenuComponent';
import ExplorerComponent from '../features/explorer/ExplorerComponent';
import InitUserModal from '../features/auth/InitUserModal';
import LoginModal from '../features/auth/LoginModal';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

setupIonicReact();

export type PendingLinkType = {
  sourceAbstractId: string;
  sourceArrowId: string;
  sourceTwigId: string;
  targetAbstractId: string;
  targetArrowId: string;
  targetTwigId: string;
}

export const AppContext = createContext({} as {
  user: User | null;

  palette: 'dark' | 'light';
  setPalette: Dispatch<SetStateAction<'dark' | 'light'>>;

  newTwigId: string;
  setNewTwigId: Dispatch<SetStateAction<string>>;

  pendingLink: PendingLinkType;
  setPendingLink: Dispatch<SetStateAction<PendingLinkType>>;

  clipboardArrowIds: string[];
  setClipboardArrowIds: Dispatch<SetStateAction<string[]>>;

  isCreatingGraph: boolean;
  setIsCreatingGraph: Dispatch<SetStateAction<boolean>>;
  createGraphArrowId: string | null;
  setCreateGraphArrowId: Dispatch<SetStateAction<string | null>>;

  selectedUserId: string;
  setSelectedUserId: Dispatch<SetStateAction<string>>;

  menuMode: MenuMode;
  setMenuMode: Dispatch<SetStateAction<MenuMode>>;

  menuX: number;
  setMenuX: Dispatch<SetStateAction<number>>;

  menuIsResizing: boolean;
  setMenuIsResizing: Dispatch<SetStateAction<boolean>>;

  showInitUserModal: boolean;
  setShowInitUserModal: Dispatch<SetStateAction<boolean>>;

  showLoginModal: boolean;
  setShowLoginModal: Dispatch<SetStateAction<boolean>>;

  spaceRef: React.RefObject<ReactZoomPanPinchRef>;
});

const App: React.FC = () => {
  console.log('app');
  const user = useAppSelector(selectCurrentUser);

  const idToUser = useAppSelector(selectIdToUser);
  
  const spaceRef = useRef<ReactZoomPanPinchRef>(null);

  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  const [palette, setPalette] = useState<'dark' | 'light'>('dark');

  const [isCreatingGraph, setIsCreatingGraph] = useState(false);
  const [createGraphArrowId, setCreateGraphArrowId] = useState(null as string | null)

  const [pendingLink, setPendingLink] = useState({
    sourceAbstractId: '',
    sourceArrowId: '',
    sourceTwigId: '',
    targetAbstractId: '',
    targetArrowId: '',
    targetTwigId: '',
  });

  const [clipboardArrowIds, setClipboardArrowIds] = useState([] as string[]);

  const [newTwigId, setNewTwigId] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');

  const [menuMode, setMenuMode] = useState(MenuMode.NONE);
  const [menuX, setMenuX] = useState(MENU_WIDTH);
  const [menuIsResizing, setMenuIsResizing] = useState(false);

  const [showInitUserModal, setShowInitUserModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleRotate = () => {
      console.log('rotate', window.innerWidth, window.innerHeight);
      setIsPortrait(val => !val);
    }
    window.matchMedia('(orientation: portrait)').addEventListener('change', handleRotate);
    return () => {
      window.matchMedia('(orientation: portrait)').removeEventListener('change', handleRotate);
    }
  }, []);

  useEffect(() => {
    if (user?.palette && user?.palette !== palette) {
      setPalette(user.palette === 'light'
        ? 'light'
        : 'dark'
      );
    }
  }, [user?.palette]);

  useEffect(() => {
    document.body.classList.toggle('dark', palette === 'dark');
  }, [palette])

  const appContextValue = useMemo(() => {
    return {
      user,

      palette,
      setPalette,

      newTwigId,
      setNewTwigId,

      pendingLink,
      setPendingLink,

      isCreatingGraph,
      setIsCreatingGraph,

      createGraphArrowId,
      setCreateGraphArrowId,

      clipboardArrowIds,
      setClipboardArrowIds,

      selectedUserId,
      setSelectedUserId,

      menuMode,
      setMenuMode,
      menuX,
      setMenuX,
      menuIsResizing,
      setMenuIsResizing,

      showInitUserModal,
      setShowInitUserModal,

      showLoginModal,
      setShowLoginModal,

      spaceRef,
    };
  }, [
    user, 
    palette,
    newTwigId,
    pendingLink, 
    isCreatingGraph,
    createGraphArrowId,
    clipboardArrowIds,
    selectedUserId,
    menuMode,
    menuX,
    menuIsResizing,
    showInitUserModal,
    showLoginModal,
    spaceRef,
  ]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (menuIsResizing) {
      event.preventDefault();
      setMenuX(
        Math.max(event.clientX, MENU_MIN_WIDTH)
      );
    }
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (menuIsResizing) {
      event.preventDefault();
      setMenuIsResizing(false);
    }
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <IonApp>
        <IonReactRouter>
          <svg width={0} height={0}>
            <defs>
              {
                Object.keys(idToUser).map(userId => {
                  const user = idToUser[userId];
                  return (
                    <marker 
                      key={`marker-${userId}`}
                      id={`marker-${userId}`} 
                      markerWidth='6'
                      markerHeight='10'
                      refX='7'
                      refY='5'
                      orient='auto'
                    >
                      <polyline 
                        points='0,0 5,5 0,10'
                        fill='none'
                        stroke={user?.color}
                        strokeWidth={2}
                      />
                    </marker>
                  )
                })
              }
            </defs>
          </svg>
          <div
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} 
            style={{
              position: 'fixed',
              left: !isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                ? NOTCH_SIZE
                : 0,
              top: isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                ? NOTCH_SIZE
                : 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <AppBar />
            <div style={{
              display: menuMode === MenuMode.NONE
                ? 'none'
                : 'block',
              height: '100%',
              position: 'fixed',
              left: !isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                ? APP_BAR_X + NOTCH_SIZE
                : APP_BAR_X,
              right: isPlatform('mobile')
                ? 0 
                : menuX,
              top: isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                ? NOTCH_SIZE
                : 0,
              bottom: 0,
            }}>
              <MenuComponent isPortrait={isPortrait} />
            </div>
            <div style={{
              display: menuMode !== MenuMode.NONE && isPlatform('mobile')
                ? 'none'
                : 'block',
              position: 'fixed',
              left: menuMode === MenuMode.NONE
                ? !isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                  ? APP_BAR_X + NOTCH_SIZE
                  : APP_BAR_X
                : menuX,
              right: 0,
              top: isPortrait && isPlatform('iphone') && !isPlatform('mobileweb')
                ? NOTCH_SIZE
                : 0,
              bottom: 0,
            }}>
              <ExplorerComponent />
            </div>
          </div>
          <InitUserModal />
          <LoginModal />
          <CreateGraphModal />
          <UserModal />
        </IonReactRouter>
      </IonApp>
    </AppContext.Provider>
  );
}

export default App;

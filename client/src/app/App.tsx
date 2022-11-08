import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import SearchPage from '../pages/SearchPage';
import GraphsPage from '../pages/GraphsPage';
import ContactsPage from '../pages/ContactsPage';

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
import AboutPage from '../pages/AboutPage';
import AppBar from './AppBar';
import useAuth from '../features/auth/useAuth';
import { createContext, Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '../features/user/user';
import { useAppSelector } from './store';
import { selectCurrentUser, selectIdToUser } from '../features/user/userSlice';
import ViewerPage from '../pages/ViewerPage';
import AccountPage from '../pages/AccountPage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import CreateGraphModal from '../features/arrow/CreateGraphModal';

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

  width: number;
  height: number;

  palette: 'dark' | 'light';
  setPalette: Dispatch<SetStateAction<'dark' | 'light'>>;

  pendingLink: PendingLinkType;
  setPendingLink: Dispatch<SetStateAction<PendingLinkType>>;

  clipboardArrowIds: string[];
  setClipboardArrowIds: Dispatch<SetStateAction<string[]>>;

  isCreatingGraph: boolean;
  setIsCreatingGraph: Dispatch<SetStateAction<boolean>>;
  createGraphArrowId: string | null;
  setCreateGraphArrowId: Dispatch<SetStateAction<string | null>>;
});

const App: React.FC = () => {
  //console.log('app');
  const user = useAppSelector(selectCurrentUser);

  const idToUser = useAppSelector(selectIdToUser);

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

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

  useAuth(palette);

  const mainMenuRef = useRef<HTMLIonMenuElement>(null);
  const userMenuRef = useRef<HTMLIonMenuElement>(null);

  const appContextValue = useMemo(() => {
    return {
      user,

      width,
      height,

      palette,
      setPalette,

      pendingLink,
      setPendingLink,

      isCreatingGraph,
      setIsCreatingGraph,

      createGraphArrowId,
      setCreateGraphArrowId,

      clipboardArrowIds,
      setClipboardArrowIds,
    };
  }, [
    user, 
    width, height, 
    palette,
    pendingLink, 
    isCreatingGraph,
    createGraphArrowId,
    clipboardArrowIds,
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
      <IonApp>
        <IonReactRouter>
          <AppBar />
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
          <IonRouterOutlet id='router-outlet'>
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/account" component={AccountPage} />
            <Route exact path="/contacts" component={ContactsPage} />
            <Route exact path="/graphs" component={GraphsPage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/logout" component={LogoutPage} />
            <Route exact path="/search" component={SearchPage} />
            <Route path='/g/:routeName' component={ViewerPage}/>
            <Route exact path="/">
              <Redirect to="/about" />
            </Route>
          </IonRouterOutlet>
          <CreateGraphModal />
        </IonReactRouter>
      </IonApp>
    </AppContext.Provider>
  );
}

export default App;

import { SPACE_PANEL_WIDTH, TAB_HEIGHT } from '../../constants';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { peopleOutline, settingsOutline, sync, videocamOutline } from 'ionicons/icons';
import RolesPanel from './RolesPanel';
import { AppContext } from '../../app/App';
import SettingsPanel from './SettingsPanel';
import { MenuMode } from '../menu/menu';
import useJoinRoom from '../video/useJoinRoom';
import VideoPanel from './VideoPanel';

interface SpaceControlsProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
  showVideo: boolean;
  setShowVideo: Dispatch<SetStateAction<boolean>>;
  isSynced: boolean;
  setIsSynced: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const { palette, menuMode } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);

  const { joinRoom } = useJoinRoom();

  const handleSettingsClick = () => {
    props.setShowSettings(val => !val);
    props.setShowRoles(false);
    props.setShowVideo(false);
  };

  const handleRolesClick = () => {
    props.setShowSettings(false);
    props.setShowRoles(val => !val);
    props.setShowVideo(false);
  }

  const handleSyncClick = () => {
    props.setIsSynced(false);
    setTimeout(() => {
      props.setIsSynced(true);
    }, 100);
  };

  const handleCallClick = () => {
    if (!props.showVideo) {
      joinRoom();
    }
    props.setShowSettings(false);
    props.setShowRoles(false);
    props.setShowVideo(val => !val);

  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div onMouseMove={handleMouseMove} style={{
      display: isPlatform('mobile') && menuMode !== MenuMode.NONE
        ? 'none'
        : 'block',
      position: 'absolute',
      right: 0,
      top: 0,
      height: '100%',
      zIndex: abstract?.twigZ ?? 0 + 100,
    }}>
      <div style={{
        position: 'fixed',
        right: props.showSettings || props.showRoles || props.showVideo
          ? SPACE_PANEL_WIDTH + 5
          : 0,
      }}>
        <IonFab style={{
          marginLeft: -60,
        }}>
          <IonFabButton 
            title='Settings' 
            size='small' 
            color={props.showSettings ? 'primary' : 'secondary'}  
            onClick={handleSettingsClick}
          >
            <IonIcon icon={settingsOutline} size='small'/>
          </IonFabButton> 
          <IonFabButton 
            title='Members' 
            size='small'
            color={props.showRoles ? 'primary' : 'secondary'}
            onClick={handleRolesClick}
          >
            <IonIcon icon={peopleOutline} size='small'/>
          </IonFabButton> 
          <IonFabButton 
            title='Video Call'
            size='small'
            color={props.showVideo ? 'primary' : 'secondary'} 
            onClick={handleCallClick}
          >
            <IonIcon icon={videocamOutline} size='small' />
          </IonFabButton>  
          <IonFabButton
            title='Sync'
            size='small'
            color={!props.isSynced ? 'primary' : 'secondary'}
            onClick={handleSyncClick}
          >
            <IonIcon icon={sync} size='small' />
          </IonFabButton>
        </IonFab>
      </div>
      <div style={{
        position: 'fixed',
        top: TAB_HEIGHT,
        right: 10,
        height: '100%',
      }}>
        { props.showRoles && <RolesPanel showRoles={props.showRoles} setShowRoles={props.setShowRoles} /> }
        { props.showSettings && <SettingsPanel showSettings={props.showSettings} setShowSettings={props.setShowSettings} /> }
        { props.showVideo && <VideoPanel showVideo={props.showVideo} setShowVideo={props.setShowVideo} /> }
      </div>
    </div>
  )
}
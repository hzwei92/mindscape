import { SPACE_PANEL_WIDTH, TAB_HEIGHT } from '../../constants';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppDispatch } from '../../app/store';
import { useReactiveVar } from '@apollo/client';
import { IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { add, people, remove, settingsOutline, sync } from 'ionicons/icons';
import { spaceElVar } from '../../cache';
import RolesPanel from './RolesPanel';
import { AppContext } from '../../app/App';
import SettingsPanel from './SettingsPanel';
import { MenuMode } from '../menu/menu';

interface SpaceControlsProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
  isSynced: boolean;
  setIsSynced: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const dispatch = useAppDispatch();

  const { user, menuMode } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);

  const handleSettingsClick = () => {
    props.setShowRoles(false);
    props.setShowSettings(val => !val);
  };

  const handleRolesClick = () => {
    props.setShowSettings(false);
    props.setShowRoles(val => !val);
  }

  const handleSyncClick = () => {
    props.setIsSynced(true);
  };

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
        right: props.showSettings || props.showRoles
          ? SPACE_PANEL_WIDTH + 5
          : 0,
      }}>
            <IonFab style={{
              marginLeft: -60,
            }}>
              <IonFabButton title='Settings' size='small' color='light'  onClick={handleSettingsClick}>
                <IonIcon icon={settingsOutline} size='small' style={{
                  color: props.showSettings ? user?.color : null,
                }}/>
              </IonFabButton> 
              <IonFabButton title='Members' size='small' color='light' onClick={handleRolesClick}>
                <IonIcon icon={people} size='small' style={{
                  color: props.showRoles ? user?.color : null
                }}/>
              </IonFabButton> 
              <div style={{
                display: props.isSynced
                  ? 'none'
                  : 'block'
              }}>
                <IonFabButton title='Sync' size='small' color='primary' onClick={handleSyncClick} style={{
                  marginTop: 1,
                  fontSize: 20,
                }}>
                  <IonIcon icon={sync} size='small' />
                </IonFabButton>  
              </div>
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
      </div>
    </div>
  )
}
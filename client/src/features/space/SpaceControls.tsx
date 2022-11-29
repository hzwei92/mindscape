import { MAX_Z_INDEX, SPACE_PANEL_WIDTH } from '../../constants';
import { scaleDown, scaleUp } from '../../utils';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectScale, setScale } from './spaceSlice';
import { useReactiveVar } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { add, people, remove, settingsOutline, sync } from 'ionicons/icons';
import { spaceElVar } from '../../cache';
import RolesPanel from './RolesPanel';

interface SpaceControlsProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const dispatch = useAppDispatch();
  const { abstract, abstractId } = useContext(SpaceContext);

  const spaceEl = useReactiveVar(spaceElVar)
    
  const scale = useAppSelector(selectScale(abstractId)) ?? 1;

  const isSynced = true;

  const handleScaleDownClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!spaceEl?.current) return;
    
    const center = {
      x: (spaceEl.current.scrollLeft + (spaceEl.current.clientWidth / 2)) / scale,
      y: (spaceEl.current.scrollTop + (spaceEl.current.clientHeight / 2)) / scale,
    }
    const scale1 = scaleDown(scale);

    dispatch(setScale({
      abstractId,
      scale: scale1,
    }));

    const left = (center.x * scale1) - (spaceEl.current.clientWidth / 2);
    const top = (center.y * scale1) - (spaceEl.current.clientHeight / 2);

    spaceEl.current.scrollTo({
      left,
      top,
    })
  };

  const handleScaleUpClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!spaceEl?.current) return;

    const center = {
      x: (spaceEl.current.scrollLeft + (spaceEl.current.clientWidth / 2)) / scale,
      y: (spaceEl.current.scrollTop + (spaceEl.current.clientHeight / 2)) / scale,
    };
    const scale1 = scaleUp(scale);

    dispatch(setScale({
      abstractId,
      scale: scale1
    }));

    const left = (center.x * scale1) - (spaceEl.current.clientWidth / 2);
    const top = (center.y * scale1) - (spaceEl.current.clientHeight / 2);
    setTimeout(() => {
      spaceEl.current?.scrollTo({
        left,
        top,
      });
    }, 5)
  };

  const handleSettingsClick = () => {
    props.setShowSettings(val => !val);
  };

  const handleRolesClick = () => {
    props.setShowRoles(val => !val);
  }

  const handleSyncClick = () => {
    // dispatch(setFocusIsSynced(true));
    // dispatch(setFocusShouldSync(true));
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div onMouseMove={handleMouseMove} style={{
      position: 'absolute',
      right: props.showRoles || props.showSettings
        ? isPlatform('ios') || isPlatform('android')
          ? 140 + SPACE_PANEL_WIDTH + 10
          : 165 + SPACE_PANEL_WIDTH + 10
        : isPlatform('ios') || isPlatform('android')
          ? 140
          : 165,
      top: 0,
      height: '100%',
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 100,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <IonCard color='light' style={{
            margin: 10,
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <IonButtons>
              <IonButton 
                disabled={scale === .03125} 
                onClick={handleScaleDownClick} 
              >
                <IonIcon icon={remove} />
              </IonButton>
            </IonButtons>
            <span style={{
              width: '50px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              paddingTop: 7,
            }}>
              { Math.round(scale * 100) }%
            </span>
            <IonButtons>
              <IonButton disabled={scale === 4} onClick={handleScaleUpClick}>
                <IonIcon icon={add} />
              </IonButton>
            </IonButtons>
          </IonCard>
          <div style={{
            textAlign: 'right',
          }}>
            <IonFab style={{
              marginLeft: -60,
            }}>
              <IonFabButton title='Settings' size='small' color={ props.showSettings ? 'primary' : 'light'}  onClick={handleSettingsClick}>
                <IonIcon icon={settingsOutline} size='small'/>
              </IonFabButton> 
              <IonFabButton title='Members' size='small' color={ props.showRoles ? 'primary' : 'light'} onClick={handleRolesClick}>
                <IonIcon icon={people} size='small'/>
              </IonFabButton> 
              <div style={{
                display: isSynced
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
        </div>
      </div>
      {
        props.showRoles
          ? <div style={{
              position: 'fixed',
              top: 32,
              right: 10,
              height: '100%',
            }}>
              <RolesPanel showRoles={props.showRoles} setShowRoles={props.setShowRoles} />
            </div>
          : null
        }
    </div>
  )
}
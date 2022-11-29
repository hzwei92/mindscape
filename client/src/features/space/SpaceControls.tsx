import { MAX_Z_INDEX } from '../../constants';
import { scaleDown, scaleUp } from '../../utils';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectScale, setScale } from './spaceSlice';
import { useReactiveVar } from '@apollo/client';
import { IonButton, IonButtons, IonCard, IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { add, people, remove, settingsOutline, sync } from 'ionicons/icons';
import { spaceElVar } from '../../cache';

interface SpaceControlsProps {
  setShowSettings: Dispatch<SetStateAction<boolean>>;
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

  return (
    <div style={{
      position: 'absolute',
      right: isPlatform('ios') || isPlatform('android')
        ? 140
        : 165,
      top: 0,
    }}>
      <div style={{
        position: 'fixed',
        zIndex: abstract?.twigZ ?? 0 + 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'right'
      }}>
        <IonCard color={'light'} style={{
          margin: 10,
          padding: 1,
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
        <div>
        <IonFab style={{
          right: 0,
        }}>
          <IonFabButton title='Settings' size='small' color={'light'}onClick={handleSettingsClick}>
            <IonIcon icon={settingsOutline} size='small'/>
          </IonFabButton> 
          <IonFabButton title='Members' size='small'color={'light'} onClick={handleRolesClick}>
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
  )
}
import { MAX_Z_INDEX, MOBILE_WIDTH, VIEW_RADIUS } from '../../constants';
import { scaleDown, scaleUp } from '../../utils';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectScale, selectSelectedTwigId, setScale } from './spaceSlice';
import { useReactiveVar } from '@apollo/client';
import { SpaceType } from './space';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';
import { selectIdToTwig } from '../twig/twigSlice';
import useInitSpace from './useInitSpace';
import { selectFocusTab, selectFrameTab, selectIdToTab } from '../tab/tabSlice';
import { AppContext } from '../../app/App';
import useUpdateTab from '../tab/useUpdateTab';
import useRemoveTab from '../tab/useRemoveTab';
import { IonButton, IonButtons, IonCard, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { add, close, people, remove, settingsOutline, sync } from 'ionicons/icons';

interface SpaceControlsProps {
  settingsMenuRef: React.RefObject<HTMLIonMenuElement>;
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const dispatch = useAppDispatch();
  const { user, width, palette } = useContext(AppContext);
  const { space } = useContext(SpaceContext);

  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  const idToTab = useAppSelector(selectIdToTab)
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));
  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));
  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));

  const spaceEl = useReactiveVar(space === SpaceType.FRAME
    ? frameSpaceElVar
    : focusSpaceElVar);
    
  const scale = useAppSelector(selectScale(space));

  const isSynced = true;

  const { updateTab } = useUpdateTab();
  const { removeTab } = useRemoveTab();

  const handleScaleDownClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!spaceEl?.current) return;
    
    const center = {
      x: (spaceEl.current.scrollLeft + (spaceEl.current.clientWidth / 2)) / scale,
      y: (spaceEl.current.scrollTop + (spaceEl.current.clientHeight / 2)) / scale,
    }
    const scale1 = scaleDown(scale);

    dispatch(setScale({
      space,
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
      space,
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

  const handleCloseClick = (event: React.MouseEvent) => {
    if (space === SpaceType.FRAME) {
      removeTab(frameTab?.id);
      
      if (focusTab) {
        const focusTwig = focusIdToTwig[focusSelectedTwigId];
        const route = `/g/${focusTab.arrow.routeName}/${focusTwig.i || 0}`;
        //navigate(route);
      }
      else {
        //navigate(`/`);
      }
    }
    else if (space == SpaceType.FOCUS) {
      removeTab(focusTab?.id);

      if (frameTab) {
        const frameTwig = frameIdToTwig[frameSelectedTwigId];
        const route = `/g/${frameTab.arrow.routeName}/${frameTwig.i}`;
        //navigate(route);
      }
      else {
        //navigate(`/`);
      }
    }
  };

  const handleSettingsClick = () => {
    props.settingsMenuRef.current?.open();
  };

  const handleRolesClick = () => {
    props.setShowRoles(show => !show)
  }

  const handleSyncClick = () => {
    // dispatch(setFocusIsSynced(true));
    // dispatch(setFocusShouldSync(true));
  };

  return (
    <div style={{
      position: 'absolute',
      right: 210,
      top: 60,
    }}>
      <div style={{
        position: 'fixed',
        zIndex: MAX_Z_INDEX,
        display: 'flex',
        flexDirection: 'row',
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
        <IonFab>
          <IonFabButton href='/about' title='Close' size='small' color={'light'} onClick={handleCloseClick}>
            <IonIcon icon={close} size='small'/>
          </IonFabButton> 
          <IonFabButton title='Settings' size='small' color={'light'}onClick={handleSettingsClick}>
            <IonIcon icon={settingsOutline} size='small'/>
          </IonFabButton> 
          <IonFabButton title='Members' size='small'color={'light'} onClick={handleRolesClick}>
            <IonIcon icon={people} size='small'/>
          </IonFabButton> 
          <div style={{
            display: isSynced || space === 'FRAME'
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
import React, { useContext } from 'react';
import type { Twig } from './twig';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { SpaceContext } from '../space/SpaceComponent';
import { selectDrag, setDrag } from '../space/spaceSlice';
import { User } from '../user/user';
import useOpenTwig from './useOpenTwig';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonIcon, IonLabel } from '@ionic/react';
import { addOutline, closeOutline, removeOutline } from 'ionicons/icons';

interface TwigBarProps {
  twig: Twig;
  twigUser: User | null;
  isSelected: boolean;
}

function TwigBar(props: TwigBarProps) {
  const dispatch = useAppDispatch();

  const { 
    palette,
    pendingLink,
  } = useContext(AppContext);

  const {
    space, 
    abstract, 
    canEdit,
    setRemovalTwigId,
    setTouches,
  } = useContext(SpaceContext);
  
  const drag = useAppSelector(selectDrag(space));

  const { openTwig } = useOpenTwig();

  const color = palette === 'dark'
    ? 'black'
    : 'white';

  const beginDrag = () => {
    console.log('begin drag');
    if (!props.twig.parent) return;
    dispatch(setDrag({
      space,
      drag: {
        ...drag,
        isScreen: false,
        twigId: props.twig.id,
        targetTwigId: '',
      }
    }));
  }

  const dontDrag = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleToggleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTwig(props.twig, !props.twig.isOpen);
  }

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setRemovalTwigId(props.twig.id);
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    beginDrag();
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    event.stopPropagation();
    setTouches(event.touches);
    beginDrag();
  }

  return (
    <div
      title={props.twig.id}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        backgroundColor: props.twigUser?.color,
        textAlign: 'left',
        cursor: abstract?.id === props.twig.detailId
          ? pendingLink.sourceArrowId
            ? 'crosshair'
            : 'default'
          : pendingLink.sourceArrowId
            ? 'crosshair'
            : drag.twigId
              ? 'grabbing'
              : 'grab',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '3px',
        paddingRight: '5px',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <IonLabel style={{
              marginLeft: '3px',
              fontSize: 10,
              color: palette === 'dark'
                ? 'black'
                : 'white',
            }}>
              {props.twig.i}
            </IonLabel>
          </div>
        </div>
        <IonButtons>
          <IonButton
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleToggleOpenClick}
            style={{
              height: 20,
            }}
          >
            {
              props.twig.isOpen
                ? <IonIcon icon={removeOutline} style={{
                    color: palette === 'dark'
                      ? 'black'
                      : 'white',
                    fontSize: 10,
                  }}/>
                : <IonIcon icon={addOutline} style={{
                    color: palette === 'dark'
                      ? 'black'
                      : 'white',
                    fontSize: 10,                  
                  }}/>
            }
          </IonButton>
          <IonButton
            disabled={
              abstract?.id === props.twig.detailId || 
              !canEdit || 
              !!pendingLink.sourceArrowId 
            } 
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleRemoveClick}
            style={{
              height: 20,
            }}
          >
            <IonIcon icon={closeOutline} style={{
              color: palette === 'dark'
                ? 'black'
                : 'white',
              fontSize: 10,
            }}/>
          </IonButton>
        </IonButtons>
      </div>
    </div>
  )
}

export default React.memo(TwigBar)
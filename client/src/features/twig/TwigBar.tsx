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
  } = useContext(SpaceContext);
  
  const drag = useAppSelector(selectDrag(space));

  const { openTwig } = useOpenTwig();

  const color = palette === 'dark'
    ? 'black'
    : 'white';

  const beginDrag = () => {
    if (!props.twig.parent) return;
    console.log('begin drag');
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

  return (
    <div
      title={props.twig.id}
      onMouseDown={handleMouseDown}
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
          fontSize: 14,
        }}>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <IonLabel style={{
            marginLeft: '3px',
            fontSize: 12,
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
            size='small'
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleToggleOpenClick}
          >
            {
              props.twig.isOpen
                ? <IonIcon icon={removeOutline} size='medium' style={{
                    color: palette === 'dark'
                      ? 'black'
                      : 'white'
                  }}/>
                : <IonIcon icon={addOutline} size='medium'  style={{
                    color: palette === 'dark'
                      ? 'black'
                      : 'white'
                  }}/>
            }
          </IonButton>
          <IonButton
            disabled={
              abstract?.id === props.twig.detailId || 
              !canEdit || 
              !!pendingLink.sourceArrowId 
            } 
            size='small'
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleRemoveClick}
          >
            <IonIcon icon={closeOutline} size='medium' style={{
              color: palette === 'dark'
                ? 'black'
                : 'white'
            }}/>
          </IonButton>
        </IonButtons>
      </div>
    </div>
  )
}

export default React.memo(TwigBar)
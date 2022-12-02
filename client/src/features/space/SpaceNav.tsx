import React, { useContext, useEffect, useState } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppSelector } from '../../app/store';
import useSelectTwig from '../twig/useSelectTwig';
import { Twig } from '../twig/twig';
import { MAX_Z_INDEX, VIEW_RADIUS } from '../../constants';
import { selectIdToTwig, selectSelectedTwigId } from './spaceSlice';
import { selectIdToUser } from '../user/userSlice';
import { AppContext } from '../../app/App';
import { IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { playBackOutline, playForwardOutline, playSkipBackOutline, playSkipForwardOutline, scanOutline } from 'ionicons/icons';
import { MenuMode } from '../menu/menu';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

interface SpaceNavProps {
  spaceEl: React.RefObject<HTMLIonCardElement>;
}
export default function SpaceNav(props: SpaceNavProps) {
  const {
    menuMode,
    spaceRef,
  } = useContext(AppContext);

  const { 
    abstractId, 
    abstract, 
    canEdit
  } = useContext(SpaceContext);

  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));

  const idToTwig = useAppSelector(selectIdToTwig(abstractId)) ?? {};

  const [twigs, setTwigs] = useState([] as Twig[]);
  const [index, setIndex] = useState(0);
  const hasEarlier = index > 0;
  const hasLater = index < twigs.length - 1;

  const [twigsAbstractId, setTwigsAbstractId] = useState('');

  const { selectTwig } = useSelectTwig(abstractId, canEdit);

  
  useEffect(() => {
    const twigs1 = Object.keys(idToTwig).map(id => idToTwig[id])
      .filter(twig => (
        twig && 
        !twig.deleteDate && 
        twig.sourceId === twig.targetId && 
        twig.abstractId === abstract?.id
      ))
      .sort((a, b) => a.i < b.i ? -1 : 1);
      
    setTwigs(twigs1);
    setTwigsAbstractId(abstractId);

  }, [idToTwig]);

  useEffect(() => {
    if (!selectedTwigId || twigsAbstractId !== abstractId) return;

    twigs.some((twig, i) => {
      if (twig.id === selectedTwigId) {
        setIndex(i);
        return true;
      }
      return false;
    });
  }, [selectedTwigId, twigs, twigsAbstractId]);


  const centerTwig = (twig: Twig) => {
    if (spaceRef.current) {
      const { zoomToElement } = spaceRef.current;
      zoomToElement('twig-' + twig.id, undefined, 200);
    }
  }

  const select = (twig: Twig, isInstant?: boolean) => {
    if (selectedTwigId !== twig.id) {
      selectTwig(abstract, twig);
    }
    centerTwig(twig);
    setIndex(twig.i);
  }

  const handleNavEarliest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[0];
    select(twig);
  }

  const handleNavPrev = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[index - 1];
    select(twig);
  }

  const handleNavNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[index + 1];
    select(twig);
  }

  const handleNavLatest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[twigs.length - 1];
    select(twig);
  }

  const handleNavFocus = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const twig = twigs[index];
    centerTwig(twig);
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
      marginLeft: -140,
      left: '50%',
      bottom: 70,
      zIndex: abstract?.twigZ ?? 0 + 100,
    }}>
    <IonFab style={{
      position: 'fixed',
      whiteSpace: 'nowrap',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <IonFabButton title='Earliest' disabled={!hasEarlier} color={'light'} onClick={handleNavEarliest} size='small'>
        <IonIcon icon={playSkipBackOutline} />
      </IonFabButton>
      <IonFabButton title='Previous' disabled={!hasEarlier} color={'light'} onClick={handleNavPrev} size='small'>
        <IonIcon icon={playBackOutline} />
      </IonFabButton>
      <IonFabButton title='Selected' disabled={!selectedTwigId} color={'light'} onClick={handleNavFocus} size='small' onKeyDown={e => console.log(e.key)}>
        { twigs[index]?.i }
      </IonFabButton>
      <IonFabButton title='Next' disabled={!hasLater} color={'light'} onClick={handleNavNext} size='small'>
        <IonIcon icon={playForwardOutline}/>
      </IonFabButton>
      <IonFabButton title='Latest' disabled={!hasLater} color={'light'} onClick={handleNavLatest} size='small'>
        <IonIcon icon={playSkipForwardOutline} />
      </IonFabButton>
    </IonFab>
    </div>
  );
}
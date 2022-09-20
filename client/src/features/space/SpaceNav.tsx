import React, { useContext, useEffect, useState } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppSelector } from '../../app/store';
import { selectIdToTwig } from '../twig/twigSlice';
import useCenterTwig from '../twig/useCenterTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { Twig } from '../twig/twig';
import { MAX_Z_INDEX } from '../../constants';
import { selectSelectedSpace, selectSelectedTwigId } from './spaceSlice';
import { selectIdToUser } from '../user/userSlice';
import { AppContext } from '../../app/App';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { playBackOutline, playForwardOutline, playSkipBackOutline, playSkipForwardOutline, scanOutline } from 'ionicons/icons';

export default function SpaceNav() {
  const {
    palette
  } = useContext(AppContext);

  const { 
    space, 
    abstract, 
    canEdit
  } = useContext(SpaceContext);

  const selectedSpace = useAppSelector(selectSelectedSpace);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));

  const idToTwig = useAppSelector(selectIdToTwig(space));
  const idToUser = useAppSelector(selectIdToUser);

  const [twigs, setTwigs] = useState([] as Twig[]);
  const [index, setIndex] = useState(0);
  const hasEarlier = index > 0;
  const hasLater = index < twigs.length - 1;

  const { centerTwig } = useCenterTwig(space);
  const { selectTwig } = useSelectTwig(space, canEdit);

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
  }, [idToTwig]);

  useEffect(() => {
    if (!selectedTwigId) return;

    twigs.some((twig, i) => {
      if (twig.id === selectedTwigId) {
        setIndex(i);
        return true;
      }
      return false;
    });
  }, [selectedTwigId]);

  const select = (twig: Twig, isInstant?: boolean) => {
    if (selectedTwigId !== twig.id) {
      selectTwig(abstract, twig);
    }
    centerTwig(twig.id, !isInstant, 0);
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
    centerTwig(twig.id, true, 0);
  }
  
  return (
    <div style={{
      position: 'absolute',
      marginLeft: -140,
      left: '50%',
      bottom: 60,
      zIndex: MAX_Z_INDEX + 100,
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
      <IonFabButton title='Selected' disabled={!selectedTwigId} color={'light'} onClick={handleNavFocus} size='small'>
        <IonIcon icon={scanOutline}/>
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
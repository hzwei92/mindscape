import React, { useContext, useEffect, useState } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppSelector } from '../../app/store';
import useSelectTwig from '../twig/useSelectTwig';
import { Twig } from '../twig/twig';
import { selectIdToTwig, selectIToTwigId, selectSelectedTwigId } from './spaceSlice';
import { AppContext } from '../../app/App';
import { IonFab, IonFabButton, IonIcon, isPlatform } from '@ionic/react';
import { playBackOutline, playForwardOutline, playSkipBackOutline, playSkipForwardOutline } from 'ionicons/icons';
import { MenuMode } from '../menu/menu';
import { userInfo } from 'os';
import useSetUserNavDate from '../user/useSetUserNavDate';

export default function SpaceNav() {
  const {
    user,
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
  const iToTwigId = useAppSelector(selectIToTwigId(abstractId)) ?? {};

  const selectedTwig = idToTwig[selectedTwigId];

  const earliestTwigId = iToTwigId[0];
  
  const [earlierTwigId, setEarlierTwigId] = useState('');
  const [laterTwigId, setLaterTwigId] = useState('');
  const [latestTwigId, setLatestTwigId] = useState('');
  
  const [navCount, setNavCount] = useState(0);

  const { setUserNavDate } = useSetUserNavDate(); 

  useEffect(() => {
    if (navCount > 3) {
      setUserNavDate();
    }
  }, [navCount > 3])

  useEffect(() => {
    if (!abstract || !selectedTwig) {
      setEarlierTwigId('');
      setLaterTwigId('');
      setLatestTwigId('');
      return;
    };
    
    let latestI = 0;
    let laterI = abstract?.twigN + 1;
    let earlierI = -1;
    Object.keys(iToTwigId).forEach(index => {
      const twigId = iToTwigId[index];
      const twig = idToTwig[twigId];

      if (!twig) return;

      if (twig.sourceId !== twig.targetId && !twig.isOpen) return;

      const i = parseInt(index);

      if (i > latestI) {
        latestI = i;
      }

      if (i > selectedTwig.i && i < laterI) {
        laterI = i;
      }

      if (i < selectedTwig.i && i > earlierI) {
        earlierI = i;
      }
    });


    setEarlierTwigId(iToTwigId[earlierI]);
    setLaterTwigId(iToTwigId[laterI]);
    setLatestTwigId(iToTwigId[latestI]);
  }, [iToTwigId, selectedTwig, abstract, idToTwig]);

  const { selectTwig } = useSelectTwig();

  
  const centerTwig = (twig: Twig) => {
    if (spaceRef.current) {
      const { zoomToElement } = spaceRef.current;
      zoomToElement('twig-' + twig.id, undefined, 200);
    }
  }

  const select = (twig: Twig) => {
    if (twig?.id) {
      if (selectedTwigId !== twig.id) {
        selectTwig(abstract, twig, canEdit);
      }
    }
  }

  const handleNavEarliest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = idToTwig[earliestTwigId];
    select(twig);

    if (!user?.navigateGraphDate) {
      setNavCount(val => val + 1);
    }
  }

  const handleNavPrev = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = idToTwig[earlierTwigId];
    select(twig);

    if (!user?.navigateGraphDate) {
      setNavCount(val => val + 1);
    }
  }

  const handleNavNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = idToTwig[laterTwigId];
    select(twig);

    if (!user?.navigateGraphDate) {
      setNavCount(val => val + 1);
    }
  }

  const handleNavLatest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = idToTwig[latestTwigId];
    select(twig);

    if (!user?.navigateGraphDate) {
      setNavCount(val => val + 1);
    }
  }

  const handleNavFocus = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    centerTwig(selectedTwig);

    if (!user?.navigateGraphDate) {
      setNavCount(val => val + 1);
    }
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
      <IonFabButton title='Earliest' disabled={!selectedTwigId || selectedTwigId === earliestTwigId} color={'secondary'} onClick={handleNavEarliest} size='small'>
        <IonIcon icon={playSkipBackOutline} />
      </IonFabButton>
      <IonFabButton title='Previous' disabled={!earlierTwigId} color={'secondary'} onClick={handleNavPrev} size='small'>
        <IonIcon icon={playBackOutline} />
      </IonFabButton>
      <IonFabButton title='Selected' disabled={!selectedTwigId} color={'secondary'} onClick={handleNavFocus} size='small' onKeyDown={e => console.log(e.key)}>
        { selectedTwig?.i }
      </IonFabButton>
      <IonFabButton title='Next' disabled={!laterTwigId} color={'secondary'} onClick={handleNavNext} size='small'>
        <IonIcon icon={playForwardOutline}/>
      </IonFabButton>
      <IonFabButton title='Latest' disabled={selectedTwigId===latestTwigId} color={'secondary'} onClick={handleNavLatest} size='small'>
        <IonIcon icon={playSkipForwardOutline} />
      </IonFabButton>
    </IonFab>
    </div>
  );
}
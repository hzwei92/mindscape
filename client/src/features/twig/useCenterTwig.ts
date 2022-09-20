import { useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { useAppSelector } from '../../app/store';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';
import { VIEW_RADIUS } from '../../constants';
import { SpaceType } from '../space/space';
import { selectIdToPos, selectScale } from '../space/spaceSlice';

export default function useCenterTwig(space: SpaceType) {
  const { 
    user,
    width,
  } = useContext(AppContext);

  const spaceEl = useReactiveVar(space === SpaceType.FRAME
    ? frameSpaceElVar
    : focusSpaceElVar);

  const idToPos = useAppSelector(selectIdToPos(space));
  const scale = useAppSelector(selectScale(space));

  const centerTwig = (twigId: string, isSmooth: boolean, delay: number, coords?: any) => {
    setTimeout(() => {
      if (!spaceEl?.current) return;
      if (!user) return;
      
      const pos = idToPos[twigId];

      console.log('centerTwig', pos, space, twigId);

      const x1 = ((coords?.x ?? pos?.x ?? 0) + VIEW_RADIUS) * scale;
      const y1 = ((coords?.y ?? pos?.y ?? 0) + VIEW_RADIUS) * scale;

      spaceEl.current.scrollTo({
        left: (x1 - ((spaceEl.current.clientWidth || width ) / 2 || VIEW_RADIUS)),
        top: (y1 - spaceEl.current.clientHeight / 2),
        behavior: isSmooth 
          ? 'smooth'
          : 'auto',
      })
    }, delay);
  }

  return { centerTwig };
} 
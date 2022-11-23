import { useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { useAppSelector } from '../../app/store';
import { spaceElVar } from '../../cache';
import { VIEW_RADIUS } from '../../constants';
import { selectIdToPos, selectScale } from '../space/spaceSlice';

export default function useCenterTwig(abstractId: string) {
  const { 
    user,
    width,
  } = useContext(AppContext);

  const spaceEl = useReactiveVar(spaceElVar);

  const idToPos = useAppSelector(selectIdToPos(abstractId)) || {};
  const scale = useAppSelector(selectScale(abstractId)) || 1;

  const centerTwig = (twigId: string, isSmooth: boolean, delay: number, coords?: any) => {
    setTimeout(() => {
      if (!spaceEl?.current) return;
      if (!user) return;
      
      const pos = idToPos[twigId];

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
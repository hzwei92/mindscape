import { Twig } from './twig';
import { IdToType } from '../../types';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectIdToTwig, selectShouldReloadTwigTree, setTwigTree } from '../space/spaceSlice';

export default function useTwigTree(abstractId: string) {
  const dispatch = useAppDispatch();

  const shouldReloadTwigTree = useAppSelector(selectShouldReloadTwigTree(abstractId));
  const idToTwig = useAppSelector(selectIdToTwig(abstractId));

  useEffect(() => {
    if (!shouldReloadTwigTree) return;
    const twigs: Twig[] = Object.values(idToTwig || {});
    loadTwigTree(twigs);
  }, [shouldReloadTwigTree, idToTwig]);

  const loadTwigTree = (twigs: Twig[]) => {
    const idToChildIdToTrue: IdToType<IdToType<true>> = {};
    const idToDescIdToTrue: IdToType<IdToType<true>> = {};

    twigs.forEach(twig => {
      if (twig.parent) {
        if (idToChildIdToTrue[twig.parent.id]) {
          idToChildIdToTrue[twig.parent.id][twig.id] = true;
        }
        else {
          idToChildIdToTrue[twig.parent.id] = {
            [twig.id]: true,
          };
        }

        let twig1 = twig;
        while (twig1?.parent) {
          if (idToDescIdToTrue[twig1.parent.id]) {
            idToDescIdToTrue[twig1.parent.id][twig.id] = true;
          }
          else {
            idToDescIdToTrue[twig1.parent.id] = {
              [twig.id]: true,
            };
          }
          twig1 = idToTwig[twig1.parent.id]
        }
      }
    });

    dispatch(setTwigTree({
      abstractId,
      idToChildIdToTrue,
      idToDescIdToTrue,
    }))
  }

  return { 
    loadTwigTree,
  };
}
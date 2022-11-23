
import { gql, useMutation } from '@apollo/client';
import type { Arrow } from '../arrow/arrow';
import type { Twig } from './twig';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeTwigs, selectIdToDescIdToTrue, selectIdToTwig, setSelectedTwigId } from '../space/spaceSlice';
import { useIonRouter } from '@ionic/react';

const SELECT_TWIG = gql`
  mutation Select_Twig($sessionId: String!, $twigId: String!) {
    selectTwig(sessionId: $sessionId, twigId: $twigId) {
      twigs {
        id
        z
      }
      abstract {
        id
        twigZ
        updateDate
      }
    }
  }
`;

export default function useSelectTwig(abstractId: string, canEdit: boolean) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const sessionId = useAppSelector(selectSessionId);

  const idToTwig = useAppSelector(selectIdToTwig(abstractId)) || {};
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(abstractId)) || {};

  const [select] = useMutation(SELECT_TWIG, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const selectTwig = (abstract: Arrow | null, twig: Twig, dontNav?: boolean) => {
    if (!twig || !abstract) return;
    
    if (canEdit) {
      select({
        variables: {
          sessionId,
          twigId: twig.id,
        },
      });
    }

    dispatch(setSelectedTwigId({
      abstractId,
      selectedTwigId: twig.id,
    }));

    const twigs = [];
    Object.keys(idToDescIdToTrue[twig.id] || {})
      .map(descId => idToTwig[descId])
      .sort((a, b) => a.z < b.z ? -1 : 1)
      .forEach((t, i) => {
        const t1 = Object.assign({}, t, {
          z: abstract.twigZ + i
        });
        twigs.push(t1);
      });

    const twig1 = Object.assign({}, twig, {
      z: abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1,
    });

    twigs.push(twig1);

    dispatch(mergeTwigs({
      abstractId,
      twigs,
    }));
    
    const abstract1 = Object.assign({}, abstract, {
      twigZ: abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1
    });

    dispatch(mergeArrows([abstract1]));

    if (!dontNav) {
      const route = `/g/${abstract.routeName}/${twig.i}`;
      router.push(route);
    }
  };

  return { selectTwig };
}
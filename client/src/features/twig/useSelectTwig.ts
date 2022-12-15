
import { gql, useMutation } from '@apollo/client';
import type { Arrow } from '../arrow/arrow';
import type { Twig } from './twig';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeTwigs, selectAbstractIdToData } from '../space/spaceSlice';
import { useIonRouter, useIonToast } from '@ionic/react';

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

export default function useSelectTwig() {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();
  const router = useIonRouter();

  const sessionId = useAppSelector(selectSessionId);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const [select] = useMutation(SELECT_TWIG, {
    onError: error => {
      present('Error selecting twig: ' + error.message, 3000);
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeTwigs({
        abstractId: data.selectTwig.abstract.id,
        twigs: data.selectTwig.twigs
      }));
      dispatch(mergeArrows([data.selectTwig.abstract]))
    },
  });

  const selectTwig = (abstract: Arrow | null, twig: Twig, canEdit: boolean) => {
    if (!twig || !abstract) return;
    
    if (canEdit) {
      select({
        variables: {
          sessionId,
          twigId: twig.id,
        },
      });
    }

    const {
      idToTwig,
      idToDescIdToTrue
    } = abstractIdToData[abstract.id];

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
      abstractId: abstract.id,
      twigs,
    }));
    
    const abstract1 = Object.assign({}, abstract, {
      twigZ: abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1
    });

    dispatch(mergeArrows([abstract1]));

    router.push(`/g/${abstract.routeName}/${twig.i}`);
  };

  return { selectTwig };
}
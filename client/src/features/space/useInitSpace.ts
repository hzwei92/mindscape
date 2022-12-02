import { gql, useMutation } from '@apollo/client';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { useEffect } from 'react';
import { mergeIdToPos, mergeTwigs, selectIdToPos, selectSelectedTwigId } from './spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { useIonToast } from '@ionic/react';
import { IdToType } from '../../types';
import { PosType } from './space';
import { Twig } from '../twig/twig';
import { setAuthIsInit, setAuthIsValid } from '../auth/authSlice';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(abstractId: string) {
  const dispatch = useAppDispatch();

  const [presentToast] = useIonToast();

  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));
  const idToPos = useAppSelector(selectIdToPos(abstractId)) ?? {};

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      presentToast('Error loading graph: ' + error.message, 3000);

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

      const idToPos1 = data.getTwigs.reduce((acc: IdToType<PosType>, twig: Twig) => {
        acc[twig.id] = {
          x: twig.x,
          y: twig.y,
        };
        return acc;
      }, {});
  
      dispatch(mergeTwigs({
        abstractId,
        twigs: data.getTwigs,
      }));

      dispatch(mergeIdToPos({
        abstractId,
        idToPos: idToPos1,
      }));

      if (
        idToPos1[selectedTwigId]?.x !== idToPos[selectedTwigId]?.x || 
        idToPos1[selectedTwigId]?.y !== idToPos[selectedTwigId]?.y
      ) {
        //centerTwig(selectedTwigId || '', true, 0);
      }
    },
  });

  useEffect(() => {
    if (!abstractId) return;

    getTwigs({
      variables: {
        abstractId,
      }
    });
    if (idToPos[selectedTwigId]) {
      //centerTwig(selectedTwigId || '', true, 0);
    }
  }, [abstractId])

}
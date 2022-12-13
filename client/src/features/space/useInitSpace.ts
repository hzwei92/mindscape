import { gql, useMutation } from '@apollo/client';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { mergeIdToPos, mergeTwigs, selectSelectedTwigId } from './spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { useIonToast } from '@ionic/react';
import { IdToType } from '../../types';
import { PosType } from './space';
import { Twig } from '../twig/twig';
import { setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { selectArrowById } from '../arrow/arrowSlice';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(abstractId: string, isSynced: boolean, setIsSynced: Dispatch<SetStateAction<boolean>>) {
  const dispatch = useAppDispatch();

  const [presentToast] = useIonToast();

  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));

  const [syncAbstractId, setSyncAbstractId] = useState(abstractId);

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
      console.log(data, selectedTwigId);

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

    },
  });

  useEffect(() => {
    console.log(isSynced);
    if (!abstractId) return;

    if (abstractId !== syncAbstractId || isSynced) {
      console.log('yo yo yo')
      getTwigs({
        variables: {
          abstractId,
        }
      });
      setIsSynced(true);
      setSyncAbstractId(abstractId);
    }
  }, [abstractId, isSynced]);

}
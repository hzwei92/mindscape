import { gql, useMutation } from '@apollo/client';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { mergeTwigs, resetTwigs } from '../twig/twigSlice';
import { Dispatch, SetStateAction, useContext, useEffect } from 'react';
import { SpaceType } from './space';
import { selectSelectedTwigId } from './spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { Arrow } from '../arrow/arrow';
import useCenterTwig from '../twig/useCenterTwig';
import { useIonLoading } from '@ionic/react';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(space: SpaceType, abstract: Arrow | null, setShouldLoadTwigPositions: Dispatch<SetStateAction<boolean>>) {
  const dispatch = useAppDispatch();

  const [present, dismiss] = useIonLoading();

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));

  const { centerTwig } = useCenterTwig(SpaceType.FRAME);

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeTwigs({
        space,
        twigs: data.getTwigs,
      }));

      setShouldLoadTwigPositions(true);

      centerTwig(selectedTwigId || '', true, 0);
      
      dismiss();
    },
  });

  useEffect(() => {
    if (!abstract?.id) return;
    console.log('init Space', space, abstract.id, abstract)
    present({
      message: 'Loading...',
    });
    dispatch(resetTwigs(space));

    getTwigs({
      variables: {
        abstractId: abstract.id
      }
    });
  }, [abstract?.id])

}
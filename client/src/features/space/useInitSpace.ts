import { gql, useMutation } from '@apollo/client';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { mergeTwigs, resetTwigs } from '../twig/twigSlice';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { SpaceType } from './space';
import { selectSelectedTwigId } from './spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { Arrow } from '../arrow/arrow';
import useCenterTwig from '../twig/useCenterTwig';
import { useIonLoading, useIonToast } from '@ionic/react';
import { selectAccessToken } from '../auth/authSlice';

const GET_DETAILS = gql`
  mutation GetTwigs($accessToken: String!, $abstractId: String!) {
    getTwigs(accessToken: $accessToken, abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(space: SpaceType, abstract: Arrow | null, setShouldLoadTwigPositions: Dispatch<SetStateAction<boolean>>) {
  const dispatch = useAppDispatch();

  const [present, dismiss] = useIonLoading();

  const [presentToast] = useIonToast();

  const accessToken = useAppSelector(selectAccessToken);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));

  const { centerTwig } = useCenterTwig(SpaceType.FRAME);

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      console.error(error);
      dismiss();
      presentToast('Error loading graph: ' + error.message);
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
    console.log('init Space', space, abstract?.id, abstract);

    if (!abstract?.id) return;

    dispatch(resetTwigs(space));
    
    present({
      message: 'Loading...',
    });

    getTwigs({
      variables: {
        accessToken,
        abstractId: abstract.id
      }
    });
  }, [abstract?.id])

}
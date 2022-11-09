import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { Arrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';
import { PosType, SpaceType } from '../space/space';
import { mergeIdToPos } from '../space/spaceSlice';
import { Twig } from './twig';
import { mergeTwigs } from './twigSlice';

const OPEN_TWIG_SUB = gql`
  subscription OpenTwig($sessionId: String!, $abstractId: String!) {
    openTwig(sessionId: $sessionId, abstractId: $abstractId) {
      id
      isOpen
    }
  }
`;

export default function useOpenTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(OPEN_TWIG_SUB, {
    variables: {
      sessionId,
      abstractId: abstract?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {openTwig}}}) => {
      console.log(openTwig);

      dispatch(mergeTwigs({
        space,
        twigs: [openTwig],
      }))
    }
  });
}
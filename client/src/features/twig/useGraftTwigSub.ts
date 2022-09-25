import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { sessionVar } from '../../cache';
import { Arrow } from '../arrow/arrow';
import { SpaceType } from '../space/space';

const GRAFT_TWIG_SUB = gql`
  subscription GraftTwig($sessionId: String!, $jamId: String!) {
    graftTwig(sessionId: $sessionId, jamId: $jamId) {
      id
      x
      y
      parent {
        id
      }
    }
  }
`;

export default function useGraftTwigSub(space: SpaceType, jam: Arrow | null) {
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);


  useSubscription(GRAFT_TWIG_SUB, {
    variables: {
      sessionId: sessionDetail.id,
      jamId: jam?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {graftTwig}}}) => {
      console.log(graftTwig);

    },
  });
}
import { gql, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { selectSessionId } from '../auth/authSlice';
import { PosType } from '../space/space';
import { mergeIdToPos } from '../space/spaceSlice';
import { mergeTwigs } from '../space/spaceSlice';

const GRAFT_TWIG_SUB = gql`
  subscription GraftTwig($sessionId: String!, $abstractId: String!) {
    graftTwig(sessionId: $sessionId, abstractId: $abstractId) {
      twig {
        id
        x
        y
        parent {
          id
        }
      }
      descs {
        id
        x
        y
      }
    }
  }
`;

export default function useGraftTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(GRAFT_TWIG_SUB, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {graftTwig}}}) => {
      console.log(graftTwig);

      const { twig, descs } = graftTwig;
      dispatch(mergeTwigs({
        abstractId,
        twigs: [twig, ...descs],
      }))

      dispatch(mergeIdToPos({
        abstractId,
        idToPos: [twig, ...descs].reduce((acc: IdToType<PosType>, twig) => {
          acc[twig.id] = { 
            x: twig.x, 
            y: twig.y
          };
          return acc;
        }, {}),
      }))
    },
  });
}
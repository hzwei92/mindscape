import { gql, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { selectSessionId } from '../auth/authSlice';
import { PosType } from '../space/space';
import { mergeIdToPos } from '../space/spaceSlice';
import { Twig } from './twig';
import { mergeTwigs } from '../space/spaceSlice';

const MOVE_TWIG_SUB = gql`
  subscription MoveTwig($sessionId: String!, $abstractId: String!) {
    moveTwig(sessionId: $sessionId, abstractId: $abstractId) {
      id
      x
      y
    }
  }
`;

export default function useMoveTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector(selectSessionId);

  useSubscription(MOVE_TWIG_SUB, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {moveTwig}}}) => {
      console.log(moveTwig);

      dispatch(mergeTwigs({
        abstractId,
        twigs: [moveTwig],
      }))

      dispatch(mergeIdToPos({
        abstractId,
        idToPos: moveTwig.reduce((acc: IdToType<PosType>, twig: Twig) => {
          acc[twig.id] = {
            x: twig.x,
            y: twig.y,
          }
          return acc;
        }, {}),
      }));
    }
  });
}
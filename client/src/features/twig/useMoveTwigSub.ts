import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { sessionVar } from '../../cache';
import { IdToType } from '../../types';
import { Arrow } from '../arrow/arrow';
import { PosType, SpaceType } from '../space/space';
import { mergeIdToPos } from '../space/spaceSlice';
import { Twig } from './twig';
import { mergeTwigs } from './twigSlice';

const MOVE_TWIG_SUB = gql`
  subscription MoveTwig($sessionId: String!, $abstractId: String!) {
    moveTwig(sessionId: $sessionId, abstractId: $abstractId) {
      id
      x
      y
    }
  }
`;

export default function useMoveTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();
  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(MOVE_TWIG_SUB, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId: abstract?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {moveTwig}}}) => {
      console.log(moveTwig);

      dispatch(mergeTwigs({
        space,
        twigs: [moveTwig],
      }))

      dispatch(mergeIdToPos({
        space,
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
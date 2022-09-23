import { gql, useReactiveVar, useSubscription } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '../../app/store';
import { sessionVar } from '../../cache';
import { SpaceType } from '../space/space';
import { addCursor, removeCursor, selectIdToCursor } from './cursorSlice';

const PUBLISH_CURSOR = gql`
  subscription PublishCursor($sessionId: String!, $abstractId: String!) {
    publishCursor(sessionId: $sessionId, abstractId: $abstractId) {
      id
      name
      color
      x
      y
    }
  }
`;

export default function usePublishCursorSub(space: SpaceType, abstractId?: string) {
  const sessionDetail = useReactiveVar(sessionVar);

  const idToCursor = useAppSelector(selectIdToCursor(space));

  const dispatch = useAppDispatch();
  useSubscription(PUBLISH_CURSOR, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {publishCursor}}}) => {
      console.log(publishCursor)
      if (idToCursor[publishCursor.id]) {
        clearTimeout(idToCursor[publishCursor.id].timeout);
      }

      const timeout = setTimeout(() => {
        dispatch(removeCursor({
          space,
          id: publishCursor.id,
        }));
      }, 1000);

      publishCursor.timeout = timeout;

      dispatch(addCursor({
        space,
        cursor: publishCursor,
      }));
    },
  });
}
import { gql, useSubscription } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { addAvatar, removeAvatar, selectIdToAvatar } from './spaceSlice';

const PUBLISH_CURSOR = gql`
  subscription PublishAvatar($sessionId: String!, $abstractId: String!) {
    publishAvatar(sessionId: $sessionId, abstractId: $abstractId) {
      id
      name
      color
      x
      y
    }
  }
`;

export default function usePublishAvatarSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const idToAvatar = useAppSelector(selectIdToAvatar(abstractId));

  useSubscription(PUBLISH_CURSOR, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {publishAvatar}}}) => {
      //console.log(publishAvatar)
      if (idToAvatar[publishAvatar.id]) {
        clearTimeout(idToAvatar[publishAvatar.id].timeout);
      }

      const timeout = setTimeout(() => {
        dispatch(removeAvatar({
          abstractId,
          id: publishAvatar.id,
        }));
      }, 1000);

      publishAvatar.timeout = timeout;

      dispatch(addAvatar({
        abstractId,
        avatar: publishAvatar,
      }));
    },
  });
}
import { gql, useSubscription } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '../../app/store';
import { ACTIVE_TIME } from '../../constants';
import { selectSessionId } from '../auth/authSlice';
import { addAvatar, removeAvatar, selectAbstractIdToData } from '../space/spaceSlice';

const PUBLISH_CURSOR = gql`
  subscription PublishAvatar($sessionId: String!, $abstractIds: [String!]!) {
    publishAvatar(sessionId: $sessionId, abstractIds: $abstractIds) {
      id
      abstractId
      name
      color
      x
      y
    }
  }
`;

export default function usePublishAvatarSub(abstractIds: string[]) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const abstractIdToSpaceData = useAppSelector(selectAbstractIdToData);

  useSubscription(PUBLISH_CURSOR, {
    variables: {
      sessionId,
      abstractIds,
    },
    onSubscriptionData: ({subscriptionData: {data: {publishAvatar}}}) => {
      console.log(publishAvatar);
      const { idToAvatar } = abstractIdToSpaceData[publishAvatar.abstractId];

      if (idToAvatar[publishAvatar.id]) {
        clearTimeout(idToAvatar[publishAvatar.id].timeout);
      }
      if (publishAvatar.x === null || publishAvatar.y === null) {
        dispatch(removeAvatar({
          abstractId: publishAvatar.abstractId,
          id: publishAvatar.id,
        }));
        return;
      }

      const timeout = setTimeout(() => {
        dispatch(removeAvatar({
          abstractId: publishAvatar.abstractId,
          id: publishAvatar.id,
        }));
      }, ACTIVE_TIME);

      publishAvatar.timeout = timeout;

      dispatch(addAvatar({
        abstractId: publishAvatar.abstractId,
        avatar: publishAvatar,
      }));
    },
  });
}
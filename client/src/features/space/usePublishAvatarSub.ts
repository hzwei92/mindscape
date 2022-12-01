import { gql, useSubscription } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { AvatarType } from './space';
import { addAvatar, removeAvatar, selectAbstractIdToData, selectIdToAvatar } from './spaceSlice';

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
      console.log(publishAvatar)
      const { idToAvatar } = abstractIdToSpaceData[publishAvatar.abstractId];

      if (idToAvatar[publishAvatar.id]) {
        clearTimeout(idToAvatar[publishAvatar.id].timeout);
      }

      const timeout = setTimeout(() => {
        dispatch(removeAvatar({
          abstractId: publishAvatar.abstractId,
          id: publishAvatar.id,
        }));
      }, 5000);

      publishAvatar.timeout = timeout;

      dispatch(addAvatar({
        abstractId: publishAvatar.abstractId,
        avatar: publishAvatar,
      }));
    },
  });
}
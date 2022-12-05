import { gql, useMutation } from '@apollo/client'
import { useContext, useState } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { selectAbstractIdToData } from '../space/spaceSlice';
import { mergeUsers } from '../user/userSlice';

const PUBLISH_AVATAR = gql`
  mutation PublishAvatar($sessionId: String!, $abstractId: String!, $x: Int, $y: Int) {
    publishAvatar(sessionId: $sessionId, abstractId: $abstractId, x: $x, y: $y) {
      id
      activeDate
    }
  }
`;

export default function usePublishAvatar() {
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);

  const sessionId = useAppSelector(selectSessionId);

  const [count, setCount] = useState(0);

  const [publish] = useMutation(PUBLISH_AVATAR, {
    onError: error => {
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }
    },
    onCompleted: data => {
      //console.log(data);
      if (user?.activeDate !== data.publishAvatar.activeDate) {
        dispatch(mergeUsers([data.publishAvatar]));
      }
    }
  });

  const publishAvatar = (abstractId: string, x: number | null, y: number | null) => {
    if (!abstractId) return;

    if (x || y) {
      setCount(count => (count + 1) % 4);
      if (count !== 0) return;
    }

    publish({
      variables: {
        sessionId,
        abstractId,
        x: Math.round(x ?? 0),
        y: Math.round(y ?? 0),
      }
    });
  }

  return { publishAvatar }
}
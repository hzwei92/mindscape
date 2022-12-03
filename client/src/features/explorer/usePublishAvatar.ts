import { gql, useMutation } from '@apollo/client'
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { selectAbstractIdToData } from '../space/spaceSlice';

const PUBLISH_AVATAR = gql`
  mutation PublishAvatar($sessionId: String!, $abstractId: String!, $x: Int, $y: Int) {
    publishAvatar(sessionId: $sessionId, abstractId: $abstractId, x: $x, y: $y) {
      id
    }
  }
`;

export default function usePublishAvatar() {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const abstractIdToSpaceData = useAppSelector(selectAbstractIdToData);

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
    }
  });

  const publishAvatar = (abstractId: string, x: number | null, y: number | null) => {
    if (!abstractId) return;

    if (x || y) {
      setCount(count => (count + 1) % 4);
      if (count !== 0) return;
    }

    const { scale } = abstractIdToSpaceData[abstractId];

    publish({
      variables: {
        sessionId,
        abstractId,
        x: x && Math.round(x / scale),
        y: y && Math.round(y / scale),
      }
    });
  }

  return { publishAvatar }
}
import { gql, useMutation, useReactiveVar } from '@apollo/client'
import { useState } from 'react';
import { useAppSelector } from '../../app/store';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';
import { SpaceType } from '../space/space';
import { selectScale } from '../space/spaceSlice';

const PUBLISH_CURSOR = gql`
  mutation PublishCursor($accessToken: String!, $sessionId: String!, $abstractId: String!, $x: Int!, $y: Int!) {
    publishCursor(accessToken: $accessToken, sessionId: $sessionId, abstractId: $abstractId, x: $x, y: $y) {
      id
    }
  }
`;

export default function usePublishCursor(space: SpaceType, abstractId?: string) {
  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);
  
  const scale = useAppSelector(selectScale(space));

  const [count, setCount] = useState(0);

  const [publish] = useMutation(PUBLISH_CURSOR, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      //console.log(data);
    }
  });

  const publishCursor = (x: number, y: number) => {
    if (!abstractId) return;

    setCount(count => (count + 1) % 10);
    if (count !== 0) return;

    publish({
      variables: {
        accessToken,
        sessionId,
        abstractId,
        x: Math.round(x / scale),
        y: Math.round(y / scale),
      }
    });
  }

  return { publishCursor }
}
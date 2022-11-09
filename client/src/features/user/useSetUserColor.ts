import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';
import { mergeUsers } from './userSlice';

const SET_USER_COLOR = gql`
  mutation SetUserColor($accessToken: String!, $sessionId: String!, $color: String!) {
    setUserColor(accessToken: $accessToken, sessionId: $sessionId, color: $color) {
      id
      color
    }
  }
`;

export default function useSetUserColor() {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);

  const [setColor] = useMutation(SET_USER_COLOR, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserColor]));
    },
  });

  const setUserColor = (color: string) => {
    setColor({
      variables: {
        accessToken,
        sessionId,
        color,
      }
    });
  };

  return { setUserColor }
}

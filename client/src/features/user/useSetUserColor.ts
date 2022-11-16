import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { mergeUsers } from './userSlice';

const SET_USER_COLOR = gql`
  mutation SetUserColor($sessionId: String!, $color: String!) {
    setUserColor(sessionId: $sessionId, color: $color) {
      id
      color
    }
  }
`;

export default function useSetUserColor() {
  const dispatch = useAppDispatch();
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
        sessionId,
        color,
      }
    });
  };

  return { setUserColor }
}

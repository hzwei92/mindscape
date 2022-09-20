import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { sessionVar } from '../../cache';
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

  const sessionDetail = useReactiveVar(sessionVar);

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
        sessionId: sessionDetail.id,
        color,
      }
    });
  };

  return { setUserColor }
}

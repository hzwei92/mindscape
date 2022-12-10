import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_MOVE_TWIG_DATE = gql`
  mutation SetUserMoveTwigDate {
    setUserMoveTwigDate {
      id
      moveTwigDate
    }
  }
`;

export default function useSetUserMoveTwigDate() {
  const dispatch = useAppDispatch();

  const [setMoveTwigDate] = useMutation(SET_USER_MOVE_TWIG_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserMoveTwigDate]));
    },
  });

  const setUserMoveTwigDate = () => {
    setMoveTwigDate();
  };

  return { setUserMoveTwigDate }
}

import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_GRAFT_TWIG_DATE = gql`
  mutation SetUserGraftTwigDate {
    setUserGraftTwigDate {
      id
      graftTwigDate
    }
  }
`;

export default function useSetUserGraftTwigDate() {
  const dispatch = useAppDispatch();

  const [setGraftTwigDate] = useMutation(SET_USER_GRAFT_TWIG_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserGraftTwigDate]));
    },
  });

  const setUserGraftTwigDate = () => {
    setGraftTwigDate();
  };

  return { setUserGraftTwigDate }
}

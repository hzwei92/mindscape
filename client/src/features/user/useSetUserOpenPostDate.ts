import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_OPEN_POST_DATE = gql`
  mutation SetUserOpenPostDate {
    setUserOpenPostDate {
      id
      openPostDate
    }
  }
`;

export default function useSetUserOpenPostDate() {
  const dispatch = useAppDispatch();

  const [setOpenPostDate] = useMutation(SET_USER_OPEN_POST_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserOpenPostDate]));
    },
  });

  const setUserOpenPostDate = () => {
    setOpenPostDate();
  };

  return { setUserOpenPostDate }
}

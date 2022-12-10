import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_VIEW_INFO_DATE = gql`
  mutation SetUserViewInfoDate {
    setUserViewInfoDate {
      id
      viewInfoDate
    }
  }
`;

export default function useSetUserViewInfoDate() {
  const dispatch = useAppDispatch();

  const [setViewInfoDate] = useMutation(SET_USER_VIEW_INFO_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserViewInfoDate]));
    },
  });

  const setUserViewInfoDate = () => {
    setViewInfoDate();
  };

  return { setUserViewInfoDate }
}

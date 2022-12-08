import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_NAV_DATE = gql`
  mutation SetUserNavDate {
    setUserNavDate {
      id
      navigateGraphDate
    }
  }
`;

export default function useSetUserNavDate() {
  const dispatch = useAppDispatch();

  const [setNavDate] = useMutation(SET_USER_NAV_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserNavDate]));
    },
  });

  const setUserNavDate = () => {
    setNavDate();
  };

  return { setUserNavDate }
}

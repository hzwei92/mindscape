import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_OPEN_LINK_DATE = gql`
  mutation SetUserOpenLinkDate {
    setUserOpenLinkDate {
      id
      openLinkDate
    }
  }
`;

export default function useSetUserOpenLinkDate() {
  const dispatch = useAppDispatch();

  const [setOpenLinkDate] = useMutation(SET_USER_OPEN_LINK_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserOpenLinkDate]));
    },
  });

  const setUserOpenLinkDate = () => {
    setOpenLinkDate();
  };

  return { setUserOpenLinkDate }
}

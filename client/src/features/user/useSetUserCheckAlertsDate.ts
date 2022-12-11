import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { mergeUsers } from './userSlice';

const SET_USER_CHECK_ALERTS_DATE = gql`
  mutation SetUserCheckAlertsDate {
    setUserCheckAlertsDate {
      id
      checkAlertsDate
    }
  }
`;

export default function useSetUserCheckAlertsDate() {
  const dispatch = useAppDispatch();

  const [setCheckAlertsDate] = useMutation(SET_USER_CHECK_ALERTS_DATE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserCheckAlertsDate]));
    },
  });

  const setUserCheckAlertsDate = () => {
    setCheckAlertsDate();
  };

  return { setUserCheckAlertsDate }
}

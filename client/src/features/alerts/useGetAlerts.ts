import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../../app/store";
import { FULL_ALERT_FIELDS } from "./alertFragments";
import { mergeAlerts } from "./alertSlice";

const GET_ALERTS = gql`
  mutation GetCurrentUserAlerts {
    getCurrentUserAlerts {
      ...FullAlertFields
    }
  }
  ${FULL_ALERT_FIELDS}
`;

export default function useGetAlerts() {
  const dispatch = useAppDispatch();

  const [get] = useMutation(GET_ALERTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeAlerts(data.getCurrentUserAlerts));
    }
  });

  const getAlerts = () => {
    get()
  }

  return { getAlerts };
}
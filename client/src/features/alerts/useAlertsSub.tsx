import { gql, useSubscription } from "@apollo/client";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { useAppDispatch } from "../../app/store";
import { FULL_ALERT_FIELDS } from "./alertFragments";
import { mergeAlerts } from "./alertSlice";

const ALERTS_SUB = gql`
  subscription Alert($userId: String!) {
    alert(userId: $userId) {
      ...FullAlertFields
    }
  }
  ${FULL_ALERT_FIELDS}
`;

export default function useAlertsSub() {
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);

  useSubscription(ALERTS_SUB, {
    variables: {
      userId: user?.id
    },
    onSubscriptionData: ({ subscriptionData: { data: {alert}} }) => {
      console.log(alert);
      if (alert) {
        dispatch(mergeAlerts([alert]));
      }
    }
  });
}
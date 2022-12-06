import { gql, useMutation } from "@apollo/client";
import { useIonToast } from "@ionic/react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/store";
import { setAuthIsInit, setAuthIsValid } from "../auth/authSlice";
import { mergeTabs } from "./tabSlice";

const REMOVE_TAB = gql`
  mutation RemoveTab($tabId: String!) {
    removeTab(tabId: $tabId) {
      tab {
        id
        deleteDate
      }
      sibs {
        id
        i
      }
    }
  }
`;

export default function useRemoveTab() {
  const dispatch = useDispatch();

  const [present] = useIonToast();

  const [remove] = useMutation(REMOVE_TAB, {
    onError: err => {
      present('Error removing tab: ' + err.message, 3000);
      if (err.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(err);
      }
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs([data.removeTab.tab, ...data.removeTab.sibs]));
    }
  });

  const removeTab = (tabId: string | undefined) => {
    if (!tabId) return;

    remove({
      variables: {
        tabId,
      }
    });

  }

  return { removeTab };
}
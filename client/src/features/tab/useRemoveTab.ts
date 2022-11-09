import { gql, useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/store";
import { selectAccessToken } from "../auth/authSlice";
import { mergeTabs } from "./tabSlice";

const REMOVE_TAB = gql`
  mutation RemoveTab($accessToken: String!, $tabId: String!) {
    removeTab(accessToken: $accessToken, tabId: $tabId) {
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

  const accessToken = useAppSelector(selectAccessToken);

  const [remove] = useMutation(REMOVE_TAB, {
    onError: err => {
      console.error(err);
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
        accessToken,
        tabId,
      }
    });


  }

  return { removeTab };
}
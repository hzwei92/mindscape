import { gql, useMutation } from "@apollo/client";
import { useIonToast } from "@ionic/react";
import { useDispatch } from "react-redux";
import { setAuthIsComplete, setAuthIsInit, setAuthIsValid } from "../auth/authSlice";

const MOVE_TAB = gql`
  mutation MoveTab($tabId: String!, $i: Int!) {
    moveTab(tabId: $tabId, i: $i) {
      id
      i
    }
  }
`;

export default function useMoveTab() {
  const dispatch = useDispatch();
  const [present] = useIonToast();

  const [move] = useMutation(MOVE_TAB, {
    onError: err => {
      present('Error moving tab: ' + err.message, 3000);
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
    }
  });

  const moveTab = (tabId: string, i: number) => {
    move({
      variables: {
        tabId,
        i,
      },
    });
  };

  return { moveTab };
}
import { gql, useMutation } from "@apollo/client";
import { useIonRouter, useIonToast } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectIdToArrow } from "../arrow/arrowSlice";
import { setAuthIsInit, setAuthIsValid } from "../auth/authSlice";
import { Tab } from "./tab";
import { FULL_TAB_FIELDS } from "./tabFragments";
import { mergeTabs, selectFocusTab, selectFrameTab } from "./tabSlice";


const UPDATE_TAB = gql`
  mutation UpdateTab($tabId: String!, $isFrame: Boolean!, $isFocus: Boolean!) {
    updateTab(tabId: $tabId, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`;

export default function useUpdateTab() {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const focusTab = useAppSelector(selectFocusTab);
  const frameTab = useAppSelector(selectFrameTab);

  const [update] = useMutation(UPDATE_TAB, {
    onError: err => {
      present('Error updating tabs: ' + err.message, 3000);
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
      dispatch(mergeTabs(data.updateTab));
    }
  });

  const updateTab = (tab: Tab | null, isFrame: boolean, isFocus: boolean) => {
    if (!tab) return;

    update({
      variables: {
        tabId: tab.id,
        isFrame,
        isFocus,
      }
    });

    const tab1 = {
      ...tab,
      isFrame,
      isFocus,
    };
    dispatch(mergeTabs([tab1]));

    if (isFrame) {
      const frameTab1 = {
        ...frameTab,
        isFrame: false,
      } as Tab;
      dispatch(mergeTabs([frameTab1]));
    }
    else if (isFocus) {
      const focusTab1 = {
        ...focusTab,
        isFocus: false,
      } as Tab;
      dispatch(mergeTabs([focusTab1]));
    }
  }

  return { updateTab };
}
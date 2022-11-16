import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { Tab } from "./tab";
import { FULL_TAB_FIELDS } from "./tabFragments";
import { mergeTabs, selectFocusTab, selectFrameTab } from "./tabSlice";


const UPDATE_TAB = gql`
  mutation UpdateTab($tabId: String!, $i: Int!, $isFrame: Boolean!, $isFocus: Boolean!) {
    updateTab(tabId: $tabId, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`;

export default function useUpdateTab() {
  const dispatch = useAppDispatch();

  const focusTab = useAppSelector(selectFocusTab);
  const frameTab = useAppSelector(selectFrameTab);

  const [update] = useMutation(UPDATE_TAB, {
    onError: err => {
      console.error(err);
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
        i: tab.i,
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
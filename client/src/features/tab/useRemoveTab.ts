import { gql, useMutation } from "@apollo/client";
import { useIonRouter, useIonToast } from "@ionic/react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/store";
import { setAuthIsInit, setAuthIsValid } from "../auth/authSlice";
import { selectAbstractIdToData } from "../space/spaceSlice";
import { Tab } from "./tab";
import { mergeTabs, selectIdToTab } from "./tabSlice";

const REMOVE_TAB = gql`
  mutation RemoveTab($tabId: String!) {
    removeTab(tabId: $tabId) {
      tab {
        id
        isFocus
        deleteDate
      }
      sibs {
        id
        i
        isFocus
      }
    }
  }
`;

export default function useRemoveTab() {
  const dispatch = useDispatch();

  const [present] = useIonToast();
  const router = useIonRouter();

  const idToTab = useAppSelector(selectIdToTab);
  const abstractIdToData = useAppSelector(selectAbstractIdToData);

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

  const removeTab = (tab: Tab) => {
    if (!tab.id) return;

    if (tab.isFocus) {
      const tabs1 = [{
        ...tab,
        isFocus: false,
        deleteDate: new Date().toISOString(),
      } as Tab];

      const tabs = Object.values(idToTab)
        .filter(t => !t.deleteDate && t.id !== tab.id)
        .sort((a, b) => b.i - a.i)

      console.log(tabs);

      if (tabs.length > 0) {
        const twigId = abstractIdToData[tabs[0].arrowId].selectedTwigId;
        const twig = abstractIdToData[tabs[0].arrowId].idToTwig[twigId];

        tabs1.push({
          ...tabs[0],
          isFocus: true,
        } as Tab);
        dispatch(mergeTabs(tabs1));
        router.push(`/g/${tabs[0].arrow.routeName}/${twig?.i ?? 0}`);
      }
      else {
        dispatch(mergeTabs(tabs1));
        router.push('/');
      }
    }
    remove({
      variables: {
        tabId: tab.id,
      }
    });

  }

  return { removeTab };
}
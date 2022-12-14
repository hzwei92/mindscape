import { useIonRouter } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import { Tab } from "../features/tab/tab";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useUpdateTab from "../features/tab/useUpdateTab";
import { useAppDispatch, useAppSelector } from "./store";
import { Arrow } from '../features/arrow/arrow';
import { selectAbstractIdToData, setSelectedTwigId } from "../features/space/spaceSlice";
import { AppContext } from "./App";
import useCreateTab from "../features/tab/useCreateTab";

const useAppRouter = () => {
  const dispatch  = useAppDispatch();

  const router = useIonRouter();

  const { user } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab);
  const idToArrow = useAppSelector(selectIdToArrow);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const focusTab = useAppSelector(selectFocusTab);

  const [creatingTabRoutname, setCreatingTabRoutname] = useState('');

  const { createTabByRouteName } = useCreateTab(() => {
    setCreatingTabRoutname('');
  });
  const { updateTab } = useUpdateTab();


  const [syncPath, setSyncPath] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    
    const path = router.routeInfo?.pathname.split('/') || [];

    // if (path.length === syncPath.length && !path.some((p, i) => p !== syncPath[i])) {
    //   return;
    // }

    // setSyncPath(path);
    
    // console.log(path, focusTab?.arrowId);

    if (path[1] !== 'g') {
      if (focusTab?.arrow?.routeName) {
        router.push(`/g/${focusTab.arrow.routeName}/0`, undefined, 'replace')
      }
      return;
    }

    if (path[2] === '') {
      if (focusTab?.arrow?.routeName) {
        router.push(`/g/${focusTab.arrow.routeName}/0`, undefined, 'replace');
      }
      return;
    }

    let tab = null as Tab | null;
    let arrow = null as Arrow | null;
    Object.values(idToTab)
      .filter(t => !t.deleteDate)
      .some(t => {
        const a = idToArrow[t.arrowId];
        if (a && a.routeName === path[2]) {
          tab = t;
          arrow = a;
        }
        return !!tab;
      })

    if (!tab || !arrow) {
      if (creatingTabRoutname !== path[2]) {
        createTabByRouteName(path[2], null, false, true);
        setCreatingTabRoutname(path[2]);
      }
      return;
    }

    if (!tab.isFocus) {
      updateTab(tab, false, true);
    }

    if (isNaN(parseInt(path[3]))) {
      router.push(`/g/${path[2]}/0`);
      return;
    }

    const iToTwigId = abstractIdToData[arrow.id].iToTwigId;
    if (!Object.keys(iToTwigId).length) return;

    let i = parseInt(path[3]);
    let twigId = iToTwigId[i.toString()];

    if (!twigId) {
      while (i < arrow.twigN && !twigId) {
        i++;
        twigId = iToTwigId[i];
      }

      if (!twigId) {
        i = parseInt(path[3]);
        twigId = iToTwigId[i.toString()];

        while (i > 0 && !twigId) {
          i--;
          twigId = iToTwigId[i];
        }
      }
    }

    if (i !== parseInt(path[3])) {
      router.push(`/g/${path[2]}/${i}`, undefined, 'replace');
      return;
    }

    const selectedTwigId = abstractIdToData[arrow.id].selectedTwigId;
    
    if (twigId !== selectedTwigId) {
      dispatch(setSelectedTwigId({
        abstractId: arrow.id,
        twigId,
      }));
    }
  }, [user?.id, router.routeInfo, idToTab, idToArrow, abstractIdToData])
}

export default useAppRouter;
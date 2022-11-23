import { useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import { Tab } from "../features/tab/tab";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useUpdateTab from "../features/tab/useUpdateTab";
import { useAppDispatch, useAppSelector } from "./store";
import { Arrow } from '../features/arrow/arrow';
import { selectIdToPos, selectIdToTwig, selectIToTwigId, selectSelectedTwigId, setSelectedTwigId } from "../features/space/spaceSlice";
import useCenterTwig from "../features/twig/useCenterTwig";
import useSelectTwig from "../features/twig/useSelectTwig";
import { checkPermit } from "../utils";
import { Role } from "../features/role/role";
import { AppContext } from "./App";
import useCreateTab from "../features/tab/useCreateTab";
import { selectIdToRole } from "../features/role/roleSlice";

const useAppRouter = () => {
  const dispatch  = useAppDispatch();

  const router = useIonRouter();

  const { user, newTwigId } = useContext(AppContext);

  const focusTab = useAppSelector(selectFocusTab);
  const idToTab = useAppSelector(selectIdToTab);
  const idToArrow = useAppSelector(selectIdToArrow);
  const idToRole = useAppSelector(selectIdToRole);

  const selectedTwigId = useAppSelector(selectSelectedTwigId(focusTab?.arrowId || ''));

  const idToTwig = useAppSelector(selectIdToTwig(focusTab?.arrowId || '')) ?? {};
  const iToTwigId = useAppSelector(selectIToTwigId(focusTab?.arrowId || '')) ?? {};

  const abstract = idToArrow[focusTab?.arrowId || ''];

  let role = null as Role | null;
  (abstract?.roles || []).some(role_i => {
    if (role_i.userId === user?.id && !role_i.deleteDate) {
      role = idToRole[role_i.id];
      return true;
    }
    return false;
  });

  const canEdit = abstract?.userId === user?.id || checkPermit(abstract?.canEdit, role?.type)

  const { centerTwig: focusCenterTwig } = useCenterTwig(focusTab?.arrowId || '');
  const { selectTwig: focusSelectTwig } = useSelectTwig(focusTab?.arrowId || '', canEdit);

  const { createTabByRouteName } = useCreateTab();
  const { updateTab } = useUpdateTab();

  useEffect(() => {
    if (!user) return;
    
    const path = router.routeInfo?.pathname.split('/') || [];

    if (path[1] === 'g') {
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

      if (tab && arrow) {
        if (tab.isFocus) {
          document.title = arrow.title ?? '';

          const selectedTwig = idToTwig[selectedTwigId];

          console.log(selectedTwig)
          if (path[3] === '') {
            if (selectedTwig) {
              router.push(`/g/${path[2]}/${selectedTwig.i}`, undefined, 'replace');
            }
          }
          else if (path[3] !== (selectedTwig?.i ?? -1).toString()) {
            const twigId = iToTwigId[path[3] || (selectedTwig?.i ?? -1)];

            const twig = idToTwig[twigId];

            if (twig && !twig?.deleteDate) {
              if (twig.id === newTwigId) {
                console.log('select newly created twig')
                dispatch(setSelectedTwigId({
                  abstractId: tab.arrowId,
                  selectedTwigId: twig.id,
                }));
                focusCenterTwig(twigId, true, 0);
              }
              else {
                console.log('select twig by provided index');
                focusSelectTwig(tab.arrow, twig);
                focusCenterTwig(twigId, true, 0);
              }
            }
            else {
              console.log('select root twig bc provided index is invalid');
              router.push(`/g/${path[2]}/0`, undefined, 'replace');
            }
          }
        }
        else {
          updateTab(tab, false, true);
        }
      }
      else {
        createTabByRouteName(path[2], null, false, true);
      }
    }
  }, [user, router.routeInfo])
}

export default useAppRouter;
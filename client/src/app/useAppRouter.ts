import { useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import { Tab } from "../features/tab/tab";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useUpdateTab from "../features/tab/useUpdateTab";
import { useAppDispatch, useAppSelector } from "./store";
import { Arrow } from '../features/arrow/arrow';
import { selectIdToPos, selectSelectedTwigId, setSelectedTwigId } from "../features/space/spaceSlice";
import { SpaceType } from "../features/space/space";
import { selectIdToTwig, selectIToTwigId, selectNewTwigId } from "../features/twig/twigSlice";
import useCenterTwig from "../features/twig/useCenterTwig";
import useSelectTwig from "../features/twig/useSelectTwig";
import { checkPermit } from "../utils";
import { Role } from "../features/role/role";
import { AppContext } from "./App";
import useCreateTab from "../features/tab/useCreateTab";

const useAppRouter = () => {
  const dispatch  = useAppDispatch();

  const router = useIonRouter();

  const { user } = useContext(AppContext);

  const focusTab = useAppSelector(selectFocusTab);

  const { createTabByRouteName } = useCreateTab();


  let focusRole = null as Role | null;
  (user?.roles || []).filter(role_i => !role_i.deleteDate).some(role => {
    if (role.arrowId === focusTab?.arrowId) {
      focusRole = role;
      return true;
    }
    return false;
  });

  const idToTab = useAppSelector(selectIdToTab);
  const idToArrow = useAppSelector(selectIdToArrow);

  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));

  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));
  const focusIToTwigId = useAppSelector(selectIToTwigId(SpaceType.FOCUS));
  const focusIdToPos = useAppSelector(selectIdToPos(SpaceType.FOCUS));

  const newTwigId = useAppSelector(selectNewTwigId);

  const canEditFocus = checkPermit(focusTab?.arrow.canEdit, focusRole?.type);

  const { centerTwig: focusCenterTwig } = useCenterTwig(SpaceType.FOCUS);
  const { selectTwig: focusSelectTwig } = useSelectTwig(SpaceType.FOCUS, canEditFocus);

  const { updateTab } = useUpdateTab();

  useEffect(() => {
    if (!user) return;
    
    const path = router.routeInfo?.pathname.split('/') || [];
    console.log('path', path, router.routeInfo, Object.keys(focusIdToPos).length)
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
          document.title = arrow.title || ''

          console.log('selectedTwigId', focusSelectedTwigId);

          const focusSelectedTwig = focusIdToTwig[focusSelectedTwigId];
          if (path[3] !== (focusSelectedTwig?.i ?? -1).toString()) {
            const twigId = focusIToTwigId[path[3] || (focusSelectedTwig?.i ?? -1)]
            const twig = focusIdToTwig[twigId];
            if (twig?.id && !twig?.deleteDate) {
              if (twig.id === newTwigId) {
                console.log('focus, select new')
                dispatch(setSelectedTwigId({
                  space: SpaceType.FOCUS,
                  selectedTwigId: twig.id,
                }));
                focusCenterTwig(twigId, true, 0);

              }
              else {
                console.log('focus, index select');
                focusSelectTwig(tab.arrow, twig);
                focusCenterTwig(twigId, true, 0);
              }
            }
            else {
              console.log('focus, index invalid');
              router.push(`/g/${path[2]}/0`, );
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
  }, [user, router.routeInfo, Object.keys(focusIdToPos).length])
}

export default useAppRouter;
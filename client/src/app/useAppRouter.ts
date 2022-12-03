import { isPlatform, useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { selectIdToArrow } from "../features/arrow/arrowSlice";
import { Tab } from "../features/tab/tab";
import { selectFocusTab, selectIdToTab } from "../features/tab/tabSlice";
import useUpdateTab from "../features/tab/useUpdateTab";
import { useAppDispatch, useAppSelector } from "./store";
import { Arrow } from '../features/arrow/arrow';
import { selectAbstractIdToData, selectIdToPos, selectIdToTwig, selectIToTwigId, selectSelectedTwigId, setSelectedTwigId } from "../features/space/spaceSlice";
import useSelectTwig from "../features/twig/useSelectTwig";
import { checkPermit } from "../utils";
import { Role } from "../features/role/role";
import { AppContext } from "./App";
import useCreateTab from "../features/tab/useCreateTab";
import { selectIdToRole } from "../features/role/roleSlice";

const useAppRouter = () => {
  const dispatch  = useAppDispatch();

  const router = useIonRouter();

  const { user, newTwigId, spaceRef } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab);
  const idToArrow = useAppSelector(selectIdToArrow);
  const idToRole = useAppSelector(selectIdToRole);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const focusTab = useAppSelector(selectFocusTab);
  const abstract = idToArrow[focusTab?.arrowId || ''];



  const { selectTwig } = useSelectTwig();

  const { createTabByRouteName } = useCreateTab();
  const { updateTab } = useUpdateTab();

  useEffect(() => {
    if (!user?.id) return;
    
    const path = router.routeInfo?.pathname.split('/') || [];

    console.log('useAppRouter', path);

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

          const {
            idToTwig,
            idToPos,
            selectedTwigId,
            iToTwigId,
          } = abstractIdToData[arrow.id];

          if (Object.keys(idToPos).length === 0) return;
          
          const selectedTwig = idToTwig[selectedTwigId];

          console.log('selectedTwig', selectedTwig);

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
                spaceRef.current?.zoomToElement('twig-'+ twig.id, spaceRef.current.state.scale, 200)
              }
              else {
                console.log('select twig by provided index');

                let role = null as Role | null;
                (abstract?.roles || []).some(role_i => {
                  if (role_i.userId === user?.id && !role_i.deleteDate) {
                    role = idToRole[role_i.id];
                    return true;
                  }
                  return false;
                });
              
                const canEdit = arrow?.userId === user?.id || checkPermit(arrow?.canEditLayout, role?.type)
                selectTwig(tab.arrow, twig, canEdit);
                spaceRef.current?.zoomToElement('twig-'+ twig.id, 1, 200)
              }
            }
            else if (path[3] !== '0') {
              console.log('select root twig bc provided index is invalid');
              router.push(`/g/${path[2]}/0`, undefined, 'replace');
            }
          }
          else {
            spaceRef.current?.zoomToElement('twig-'+ selectedTwig.id, 1, 200);
          }
        }
        else {
          updateTab(tab, false, true);
        }
      }
      else if (path[2]) {
        createTabByRouteName(path[2], null, false, true);
      }
    }
    else {
      router.push(`/g/${focusTab?.arrow?.routeName}/0`, undefined, 'replace');
    }
  }, [user?.id, router.routeInfo])
}

export default useAppRouter;
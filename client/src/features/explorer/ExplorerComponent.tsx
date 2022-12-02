import { IonButton, IonButtons, IonCard, IonIcon, useIonRouter } from "@ionic/react";
import { add, close, returnUpBackOutline } from "ionicons/icons";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { OFF_WHITE, VIEW_RADIUS } from "../../constants";
import { Arrow } from "../arrow/arrow";
import { selectIdToArrow } from "../arrow/arrowSlice";
import SpaceComponent from "../space/SpaceComponent";
import { selectAbstractIdToData } from "../space/spaceSlice";
import usePublishAvatarSub from "./usePublishAvatarSub";
import { Tab } from "../tab/tab";
import { mergeTabs, selectFocusTab, selectIdToTab } from "../tab/tabSlice";
import useRemoveTab from "../tab/useRemoveTab";
import icon from './icon.png'
import usePublishAvatar from "./usePublishAvatar";
import { IdToType } from "../../types";
import TabComponent from "../tab/TabComponent";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function ExplorerComponent() {
  const dispatch = useAppDispatch();
  const { 
    menuX, 
    width, 
    palette, 
    setIsCreatingGraph, 
    setCreateGraphArrowId,
  } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab) ?? {};
  const idToArrow = useAppSelector(selectIdToArrow);

  const focusTab = useAppSelector(selectFocusTab);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const router = useIonRouter();
  const path = (router.routeInfo?.pathname || '').split('/');

  const [dragTabId, setDragTabId] = useState('');

  const { removeTab } = useRemoveTab();

  const [abstractIds, setAbstractIds] = useState<string[]>([]);
  
  useEffect(() => {
    setAbstractIds(Object.values(idToTab).map(tab => tab.arrowId));
  }, [idToTab])

  usePublishAvatarSub(abstractIds);

  const { publishAvatar} = usePublishAvatar();

  const [abstractId, setAbstractId] = useState('');

  useEffect(() => {
    console.log('focusTab change', focusTab, abstractId)
    if (focusTab?.id) {
      if (abstractId) {
        publishAvatar(abstractId, null, null);
      }
      setAbstractId(focusTab.arrowId);
    }
  }, [focusTab?.id])


  const handleCreateGraphClick = () => {
    setCreateGraphArrowId(null);
    setIsCreatingGraph(true);
  }

  const handleDragOver = (dropIndex: number) => (e: React.DragEvent) => {
    e.stopPropagation();

    if (!dragTabId) return;

    const tab = idToTab[dragTabId];

    if (dropIndex < tab.i) {
      const tabs = Object.values(idToTab).map(t => {
        if (t.i < dropIndex) {
          return t;
        }
        if (t.i < tab.i) {
          return { 
            ...t, 
            i: t.i + 1 
          };
        }
        if (t.id === tab.id) {
          return { 
            ...t, 
            i: dropIndex 
          };
        }
        return t;
      })

      dispatch(mergeTabs(tabs))
    }
    else {
      const tabs = Object.values(idToTab).map(t => {
        if (t.i > tab.i && t.i <= dropIndex) {
          return { 
            ...t, 
            i: t.i - 1 
          };
        }
        if (t.id === tab.id) {
          return { 
            ...t, 
            i: dropIndex 
          };
        }
        return t;
      })

      dispatch(mergeTabs(tabs))
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        overflow: 'clip',
        height: '32px',
      }}>
      <div style={{
        width: '100%',
        scrollbarWidth: 'none',
        backgroundColor: palette === 'dark'
          ? ''
          : '#efefef',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'row',
        overflowX: 'scroll',
      }}>
          {
            Object.values(idToTab)
              .filter(tab => !tab.deleteDate)
              .sort((a, b) => a.i - b.i)
              .map(tab => {
                return  (
                  <TabComponent key={'tab-' + tab.id} tab={tab} />
                );
              })
            }
            <IonCard
              style={{
                margin: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                display: 'inline-flex',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <IonButtons style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <IonButton onClick={handleCreateGraphClick} style={{
                  padding: 0,
                }}>
                  <IonIcon icon={add} />
                </IonButton>
              </IonButtons>
            </IonCard>
          </div>
        </div>
        {
          focusTab
            ? <div style={{
                position: 'relative',
                width: '100%',
                height: 'calc(100% - 32px)',
              }}>
                <SpaceComponent 
                  abstractId={focusTab?.arrowId}
                  left={menuX}
                  right={width}
                />
              </div>  
            : <IonCard style={{
                margin: 0,
                borderRadius: 0,
                height: 'calc(100% - 32px)',
                width: '100%',
                backgroundColor: palette === 'dark'
                  ? 'black'
                  : 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                  <img src={icon} />
                </div>
              </IonCard>
        }
    </div>
  );
}
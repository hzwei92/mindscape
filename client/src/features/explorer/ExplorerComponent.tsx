import { IonButton, IonButtons, IonCard, IonIcon, IonPopover } from "@ionic/react";
import { add, caretBack } from "ionicons/icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import SpaceComponent from "../space/SpaceComponent";
import usePublishAvatarSub from "./usePublishAvatarSub";
import { selectIdToTab } from "../tab/tabSlice";
import icon from './icon.png'
import usePublishAvatar from "./usePublishAvatar";
import TabComponent from "../tab/TabComponent";
import { TAB_HEIGHT } from "../../constants";
import { Tab } from "../tab/tab";
import CurrentUserTag from "./CurrentUserTag";

export default function ExplorerComponent() {
  const { 
    menuX,
    palette, 
    setIsCreatingGraph, 
    setCreateGraphArrowId,
  } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab) ?? {};
  const [abstractIds, setAbstractIds] = useState<string[]>([]);
  
  const [focusTabId, setFocusTabId] = useState('');

  const focusTab = idToTab[focusTabId];

  useEffect(() => {
    let focusTab = null as Tab | null;
    const ids: string[] = [];

    Object.values(idToTab).forEach(tab => {
      ids.push(tab.arrowId)
      if (tab.isFocus) {
        focusTab = tab;
      }
    })

    if (focusTab?.id !== focusTabId) {
      publishAvatar(abstractId, null, null);
      setFocusTabId(focusTab?.id ?? '')
      setAbstractId(focusTab?.arrowId ?? '')
    }

    if (
      ids.length !== abstractIds.length ||
      ids.some((id, i) => id !== abstractIds[i])
    ) {
      setAbstractIds(ids);
    }
  }, [idToTab])

  usePublishAvatarSub(abstractIds);

  const { publishAvatar} = usePublishAvatar();

  const [abstractId, setAbstractId] = useState('');

  const tabsRef = useRef<HTMLIonCardElement>(null);

  const handleCreateGraphClick = () => {
    setCreateGraphArrowId(null);
    setIsCreatingGraph(true);
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (tabsRef.current) {
      tabsRef.current.scrollLeft += e.deltaY;
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position:'relative',
    }}>
      <div style={{
        display: 'none',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 10,
      }}>
        <IonCard style={{
          padding: 10,
          paddingLeft: 0,
          display: 'flex',
        }}>
          <IonIcon icon={caretBack} />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            Hello
          </div>
        </IonCard>
      </div>
      <div style={{
        overflow: 'clip',
        height: TAB_HEIGHT,
        position: 'relative',
      }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 10,
          }}>
            <IonCard id={'new-tab-button'} 
              style={{
                margin: 0,
                marginLeft: 1,
                display: 'inline-flex',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'fixed',
                height: TAB_HEIGHT - 1,
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
        <IonCard color='light' ref={tabsRef} onWheel={handleWheel} style={{
          margin: 0,
          borderRadius: 0,
          width: '100%',
          scrollbarWidth: 'none',
          backgroundColor: palette === 'dark'
            ? '#444444'
            : '#dddddd',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'scroll',
          paddingLeft: 1.5,
          bottomShadow: 'none',
        }}>
          <div style={{
            display: 'flex',
            minWidth: 40,
            minHeight: TAB_HEIGHT,
          }}/>
          {
            Object.values(idToTab)
              .filter(tab => !tab.deleteDate)
              .sort((a, b) => b.i - a.i)
              .map(tab => {
                return  (
                  <TabComponent key={'tab-' + tab.id} tab={tab} />
                );
              })
          }
        </IonCard>
      </div>
      <div style={{
        position: 'relative',
        width: '100%',
        height: `calc(100% - ${TAB_HEIGHT}px)`,
      }}>
      <CurrentUserTag />
      {
        !!focusTab?.id && !focusTab.deleteDate
          ? <SpaceComponent 
              abstractId={focusTab?.arrowId}
              left={menuX}
              right={0}
            />
          : <IonCard style={{
              margin: 0,
              borderRadius: 0,
              height: `calc(100% - ${TAB_HEIGHT}px)`,
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
    </div>
  );
}
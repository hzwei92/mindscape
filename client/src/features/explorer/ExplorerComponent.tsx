import { IonButton, IonButtons, IonCard, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import SpaceComponent from "../space/SpaceComponent";
import usePublishAvatarSub from "./usePublishAvatarSub";
import { selectFocusTab, selectIdToTab } from "../tab/tabSlice";
import icon from './icon.png'
import usePublishAvatar from "./usePublishAvatar";
import TabComponent from "../tab/TabComponent";

export default function ExplorerComponent() {
  const { 
    menuX, 
    width, 
    palette, 
    setIsCreatingGraph, 
    setCreateGraphArrowId,
  } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab) ?? {};

  const focusTab = useAppSelector(selectFocusTab);

  const [abstractIds, setAbstractIds] = useState<string[]>([]);
  
  useEffect(() => {
    setAbstractIds(Object.values(idToTab).map(tab => tab.arrowId));
  }, [idToTab])

  usePublishAvatarSub(abstractIds);

  const { publishAvatar} = usePublishAvatar();

  const [abstractId, setAbstractId] = useState('');

  useEffect(() => {
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
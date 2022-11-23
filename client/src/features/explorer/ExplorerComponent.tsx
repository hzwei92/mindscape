import { IonButton, IonButtons, IonCard, IonFab, IonFabButton, IonIcon, useIonRouter } from "@ionic/react";
import { add, close } from "ionicons/icons";
import React, { useContext } from "react";
import { AppContext } from "../../app/App";
import { useAppSelector } from "../../app/store";
import { OFF_WHITE } from "../../constants";
import { Arrow } from "../arrow/arrow";
import { selectIdToArrow } from "../arrow/arrowSlice";
import SpaceComponent from "../space/SpaceComponent";
import { selectAbstractIdToData, selectSpaceData } from "../space/spaceSlice";
import { Tab } from "../tab/tab";
import { selectFocusTab, selectIdToTab } from "../tab/tabSlice";
import useRemoveTab from "../tab/useRemoveTab";


export default function ExplorerComponent() {
  const { menuX, width, palette, setIsCreatingGraph, setCreateGraphArrowId } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab) ?? {};
  const idToArrow = useAppSelector(selectIdToArrow);

  const focusTab = useAppSelector(selectFocusTab);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const router = useIonRouter();
  const path = (router.routeInfo?.pathname || '').split('/');

  const { removeTab } = useRemoveTab();

  const handleTabClick = (arrow: Arrow) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const twigId = abstractIdToData[arrow.id].selectedTwigId;
    const twig = abstractIdToData[arrow.id].idToTwig[twigId];
    router.push(`/g/${arrow.routeName}/${twig?.i ?? 0}`);
  }

  const handleTabCloseClick = (tab: Tab) => (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(tab.id);
    if (tab.id === focusTab?.id) {
      const tabs = Object.values(idToTab)
        .filter(t => !t.deleteDate && t.id !== tab.id)
        .sort((a, b) => a.i - b.i)

      if (tabs.length > 0) {
        const twigId = abstractIdToData[tabs[0].arrowId].selectedTwigId;
        const twig = abstractIdToData[tabs[0].arrowId].idToTwig[twigId];
        router.push(`/g/${tabs[0].arrow.routeName}/${twig?.i ?? 0}`);
      }
      else {
        router.push('/');
      }
    }
  }

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
        overflow: 'hidden',
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
                const arrow = idToArrow[tab.arrowId];
                if (!arrow) return null;

                const isFocus = focusTab?.id === tab.id && path[1] === 'g' && path[2] === arrow?.routeName;
                
                return  (
                  <IonCard key={'tab-'+tab.id} 
                    onClick={handleTabClick(arrow)}
                    style={{
                      margin: 0,
                      backgroundColor: isFocus
                        ? palette === 'dark'
                          ? 'black'
                          : OFF_WHITE
                        : null,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      display: 'inline-flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      color: arrow.color,
                      marginLeft: 10,
                    }}>
                      { arrow.title }
                    </div>
                    <IonButtons style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <IonButton onClick={handleTabCloseClick(tab)} style={{
                        padding: 0,
                      }}>
                        <IonIcon icon={close} />
                      </IonButton>
                    </IonButtons>
                  </IonCard>
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
                height: '100%',
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
                  👁‍🗨
                </div>
              </IonCard>
        }
    </div>
  );
}
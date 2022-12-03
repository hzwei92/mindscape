import { IonButton, IonButtons, IonCard, IonIcon, useIonRouter } from "@ionic/react";
import { close } from "ionicons/icons";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { ItemTypes, OFF_WHITE, TAB_HEIGHT } from "../../constants";
import { selectArrowById } from "../arrow/arrowSlice";
import { selectAbstractIdToData, selectIdToAvatar, selectIdToTwig, selectSelectedTwigId } from "../space/spaceSlice";
import { Tab } from "./tab";
import tabSlice, { mergeTabs, selectIdToTab } from "./tabSlice";
import useRemoveTab from "./useRemoveTab";
import { useDrag, useDrop } from "react-dnd";
import useUpdateTab from "./useUpdateTab";
import useMoveTab from "./useMoveTab";

interface TabComponentProps {
  tab: Tab;
}
export default function TabComponent(props: TabComponentProps) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const { palette } = useContext(AppContext);

  const idToTab = useAppSelector(selectIdToTab);
  const arrow = useAppSelector(state => selectArrowById(state, props.tab.arrowId));
  const idToAvatar = useAppSelector(selectIdToAvatar(arrow?.id || '')) || {};

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const { moveTab } = useMoveTab();
  const { removeTab } = useRemoveTab();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TAB,
    item: { tabId: props.tab.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [props.tab.id])

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.TAB,
      drop: (item: { tabId: string }) => {
        const tab = idToTab[item.tabId];
        console.log('drop', tab, props.tab)
        if (props.tab.i === tab.i) {
          return;
        }
  
        moveTab(tab.id, props.tab.i);

        if (props.tab.i < tab.i) {
          const tabs = Object.values(idToTab)
            .filter(tab => !tab.deleteDate)
            .sort((a, b) => a.i - b.i)
            .map((t, i) => {
              if (i < props.tab.i) {
                return t;
              }
              if (i < tab.i) {
                return { 
                  ...t, 
                  i: i + 1 
                };
              }
              if (t.id === tab.id) {
                return { 
                  ...t, 
                  i: props.tab.i 
                };
              }
              return t;
            });

          dispatch(mergeTabs(tabs))
        }
        else {
          const tabs = Object.values(idToTab)
            .filter(tab => !tab.deleteDate)
            .sort((a, b) => a.i - b.i)
            .map((t, i) => {
              if (i > tab.i && i <= props.tab.i) {
                return { 
                  ...t, 
                  i: i - 1 
                };
              }
              if (t.id === tab.id) {
                return { 
                  ...t, 
                  i: props.tab.i 
                };
              }
              return t;
            });

          dispatch(mergeTabs(tabs))
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [props.tab.id, props.tab.i, idToTab]
  )


  if (!arrow) return null;

  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const twigId = abstractIdToData[arrow.id]?.selectedTwigId;
    const twig = abstractIdToData[arrow.id]?.idToTwig[twigId];
    router.push(`/g/${arrow.routeName}/${twig?.i ?? 0}`);
  }

  const handleTabCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(props.tab.id);
    if (props.tab.isFocus) {
      const tabs = Object.values(idToTab)
        .filter(t => !t.deleteDate && t.id !== props.tab.id)
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

  return (
    <div ref={drop}>
      <IonCard
        ref={drag}
        onClick={handleTabClick}
        style={{
          margin: 0,
          marginRight: 1,
          backgroundColor: props.tab.isFocus
            ? palette === 'dark'
              ? 'black'
              : OFF_WHITE
            : null,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: 'inline-flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          flexShrink: 0,
          cursor: 'default',
          opacity: isOver ? 0.2 : 1,
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: arrow.color,
          marginLeft: 10,
          height: TAB_HEIGHT,
          fontSize: 18,
        }}>
          { arrow.title }
        </div>
        {
          Object.keys(idToAvatar).length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: 5,
            }}>
              ({ Object.keys(idToAvatar).length })
            </div>
          )
        }
        <IonButtons style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <IonButton onClick={handleTabCloseClick} style={{
            padding: 0,
          }}>
            <IonIcon icon={close} />
          </IonButton>
        </IonButtons>
    </IonCard>
    </div>
  )
}
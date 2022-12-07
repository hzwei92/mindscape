import React, { useContext, useEffect, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import useSelectTwig from '../twig/useSelectTwig';
import { selectArrowById, selectIdToArrow } from '../arrow/arrowSlice';
import ArrowComponent from '../arrow/ArrowComponent';
import EntryControls from './EntryControls';
import useGetOuts from '../arrow/useGetOuts';
import useGetIns from '../arrow/useGetIns';
import { AppContext } from '../../app/App';
import { IonCard } from '@ionic/react';
import useLinkArrows from '../arrow/useLinkArrows';
import { selectUserById } from '../user/userSlice';
import { selectIdToTwig, selectSelectedTwigId } from '../space/spaceSlice';
import { selectFocusTab } from '../tab/tabSlice';

interface EntryComponentProps {
  entry: Entry;
  depth: number;
}

export default function EntryComponent(props: EntryComponentProps) {
  const dispatch = useAppDispatch();

  const {
    pendingLink,
    setPendingLink,
  } = useContext(AppContext);

  const arrow = useAppSelector(state => selectArrowById(state, props.entry.arrowId));
  console.log(arrow);
  const arrowUser = useAppSelector(state => selectUserById(state, arrow?.userId));

  const focusTab = useAppSelector(selectFocusTab);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(focusTab?.arrowId || ''));
  
  const idToTwig = useAppSelector(selectIdToTwig(focusTab?.arrowId || '')) || {};
  const selectedTwig = idToTwig[selectedTwigId];

  // useAppSelector(state => selectInstanceById(state, props.entry.id)) // rerender on instance change
  
  // const width = useAppSelector(selectWidth);
  // const user = useAppSelector(selectUser);
  // const paletteMode = useAppSelector(selectPaletteMode);
  // const space = useAppSelector(selectSpace);
  // const framePostIdToTwigId = useAppSelector(selectFramePostIdToTwigId)
  // const focusPostIdToTwigId = useAppSelector(selectFocusPostIdToTwigId);
  // const frameIdToTwig = useAppSelector(selectFrameIdToTwig);
  // const focusIdToTwig = useAppSelector(selectFocusIdToTwig);
  // const framePostId = useAppSelector(selectFramePostId);
  // const focusPostId = useAppSelector(selectFocusPostId);
  // const frameTwig = frameIdToTwig[framePostIdToTwigId[props.entry.postId]];
  // const focusTwig = focusIdToTwig[focusPostIdToTwigId[props.entry.postId]];

  const [clickTimeout, setClickTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [isLoading, setIsLoading] = useState(false);

  const { getIns } = useGetIns(props.entry.id, props.entry.arrowId);
  const { getOuts } = useGetOuts(props.entry.id, props.entry.arrowId);

  const { linkArrows } = useLinkArrows();

  // const { centerTwig: centerFrameTwig } = useCenterTwig('FRAME');
  // const { centerTwig: centerFocusTwig } = useCenterTwig('FOCUS');

  // const { selectTwig: selectFrameTwig } = useSelectTwig('FRAME', true);
  // const { selectTwig: selectFocusTwig } = useSelectTwig('FOCUS', false); // TODO fix permission

  useEffect(() => {
    if (!props.entry.shouldGetLinks) return;
    if (props.entry.showOuts) {
      getOuts(0);
    }
    else if (props.entry.showIns) {
      getIns(0);
    }
    dispatch(updateEntry({
      ...props.entry,
      shouldGetLinks: false,
    }));
  }, [props.entry.shouldGetLinks]);

  const handleClick = (event: React.MouseEvent) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      setClickTimeout(null);
      // TODO center twig in focus?
    }
    else {
      const timeout = setTimeout(() => {
        if (pendingLink.sourceArrowId === props.entry.arrowId) {
          setPendingLink({
            sourceAbstractId: '',
            sourceArrowId: '',
            sourceTwigId: '',
            targetAbstractId: '',
            targetArrowId: '',
            targetTwigId: '',
          });
        }
        else if (pendingLink.sourceArrowId && pendingLink.targetArrowId === props.entry.arrowId) {
          linkArrows(pendingLink);
        }

        setClickTimeout(null);
      }, 400);

      setClickTimeout(timeout);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceArrowId && pendingLink.sourceArrowId !== props.entry.arrowId) {
      setPendingLink({
        ...pendingLink,
        targetAbstractId: '',
        targetArrowId: props.entry.arrowId,
        targetTwigId: '',
      });
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (pendingLink.sourceArrowId && pendingLink.sourceArrowId !== props.entry.arrowId) {
      setPendingLink({
        ...pendingLink,
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
  }

  if (!arrow) return null;

  const isLinking = pendingLink.sourceArrowId === arrow.id ||
    pendingLink.targetArrowId === arrow.id;

  return (
    <IonCard
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      onClick={handleClick}
      style={{
        margin: 5,
        marginBottom: 0,
        width: 'calc(100% - 10px)',
        backgroundColor: isLinking
          ? arrowUser?.color
          : null,
        cursor: pendingLink.sourceArrowId
          ? 'crosshair'
          : null, 
        borderLeft: props.entry.sourceId && props.entry.targetId
          ? null
          : `4px solid ${arrowUser?.color}`,
        padding: 10,
        paddingLeft: 5,
      }}
    >
      <ArrowComponent
        arrowId={props.entry.arrowId}
        instanceId={props.entry.id}
        showLinkRightIcon={!!props.entry.targetId && props.entry.targetId !== props.entry.parentId}
        showLinkLeftIcon={!!props.entry.sourceId && props.entry.sourceId !== props.entry.parentId}
        showPostIcon={!props.entry.sourceId && !props.entry.targetId}
        fontSize={14}
        tagFontSize={14}
      />
      <EntryControls
        entry={props.entry}
        arrow={arrow}
        setIsLoading={setIsLoading} 
        depth={props.depth}
      />
      {
        props.entry.bonusText && (
          <div style={{
            marginLeft: 14,
            marginTop: 10,
            fontSize: 10,
          }}>
            {props.entry.bonusText && props.entry.bonusText.map((text, i) => {
              return (
                <div key={i}>
                  {text}
                </div>
              )
            })}
          </div>
        )
      }
    </IonCard>
  )
}
import React, { useContext, useEffect, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import { MOBILE_WIDTH } from '../../constants';
import useCenterTwig from '../twig/useCenterTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { selectArrowById, selectIdToArrow } from '../arrow/arrowSlice';
import { selectSelectedSpace, selectSelectedTwigId } from '../space/spaceSlice';
import { selectIdToTwig } from '../twig/twigSlice';
import ArrowComponent from '../arrow/ArrowComponent';
import EntryControls from './EntryControls';
import useGetOuts from '../arrow/useGetOuts';
import useGetIns from '../arrow/useGetIns';
import { AppContext } from '../../app/App';
import { IonCard } from '@ionic/react';
import useLinkArrows from '../arrow/useLinkArrows';
import { arrowUpCircleSharp } from 'ionicons/icons';
import { selectUserById } from '../user/userSlice';

interface EntryComponentProps {
  entry: Entry;
  depth: number;
}

export default function EntryComponent(props: EntryComponentProps) {
  const dispatch = useAppDispatch();

  const {
    width,
    pendingLink,
    setPendingLink,
  } = useContext(AppContext);

  const arrow = useAppSelector(state => selectArrowById(state, props.entry.arrowId));
  const arrowUser = useAppSelector(state => selectUserById(state, arrow?.userId));

  const selectedSpace = useAppSelector(selectSelectedSpace);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(selectedSpace));
  
  const idToTwig = useAppSelector(selectIdToTwig(selectedSpace));
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
        margin: 10,
        marginBottom: 0,
        width: 'calc(100% - 10px)',
        backgroundColor: isLinking
          ? arrowUser?.color
          : null,
        cursor: pendingLink.sourceArrowId
          ? 'crosshair'
          : null, 
        border: null,
        padding: 5,
        minHeight: 100,
      }}
    >
      <div style={{
        marginTop: 10,
      }}>
        <ArrowComponent
          arrowId={props.entry.arrowId}
          instanceId={props.entry.id}
          showLinkRightIcon={!!props.entry.targetId && props.entry.targetId !== props.entry.parentId}
          showLinkLeftIcon={!!props.entry.sourceId && props.entry.sourceId !== props.entry.parentId}
          showPostIcon={!props.entry.sourceId && !props.entry.targetId}
          isWindow={false}
          isGroup={false}
          isTab={false}
          fontSize={20}
        />
        <EntryControls
          entry={props.entry}
          arrow={arrow}
          setIsLoading={setIsLoading} 
          depth={props.depth}
        />
      </div>

     
    </IonCard>
  )
}
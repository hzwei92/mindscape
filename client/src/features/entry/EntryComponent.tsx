import React, { useContext, useEffect, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import { MOBILE_WIDTH } from '../../constants';
import useCenterTwig from '../twig/useCenterTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { selectIdToArrow } from '../arrow/arrowSlice';
import { selectSelectedSpace, selectSelectedTwigId } from '../space/spaceSlice';
import { selectIdToTwig } from '../twig/twigSlice';
import ArrowComponent from '../arrow/ArrowComponent';
import EntryControls from './EntryControls';
import useGetOuts from '../arrow/useGetOuts';
import useGetIns from '../arrow/useGetIns';
import { AppContext } from '../../app/App';
import { IonCard } from '@ionic/react';

interface EntryComponentProps {
  entry: Entry;
  depth: number;
}

export default function EntryComponent(props: EntryComponentProps) {
  const dispatch = useAppDispatch();

  const {
    width,
    pendingLink,
  } = useContext(AppContext);

  const idToArrow = useAppSelector(selectIdToArrow);
  const arrow = idToArrow[props.entry.arrowId];

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
  // const { linkPosts } = useLinkPosts('FRAME', () => {});

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
    // if (clickTimeout) {
    //   clearTimeout(clickTimeout)
    //   setClickTimeout(null);
    //   if (frameTwig) {
    //     if (framePostId === frameTwig.postId) {
    //       centerFrameTwig(frameTwig, true, 0);
    //     }
    //     else {
    //       if (space === 'FRAME') {
    //         navigate(`/u/${user?.frame?.routeName}/${frameTwig.jamI}`);
    //       }
    //       else {
    //         centerFrameTwig(frameTwig, true, 0);
    //         selectFrameTwig(user?.frame as Jam, frameTwig, true);
    //       }
    //     }
    //   }
    //   if (focusTwig) {
    //     if (focusPostId === focusTwig.postId) {
    //       centerFocusTwig(focusTwig, true, 0);
    //     }
    //     else {
    //       if (space === 'FOCUS') {
    //         navigate(`/${user?.focus?.userId ? 'u' : 'j'}/${user?.focus?.routeName}/${focusTwig.jamI}`);
    //       }
    //       else {
    //         centerFocusTwig(focusTwig, true, 0);
    //         selectFocusTwig(user?.focus as Jam, focusTwig, true);
    //       }
    //     }
    //   }
    // }
    // else {
    //   const timeout = setTimeout(() => {
    //     if (pendingLink.sourcePostId === props.entry.postId) {
    //       dispatch(setNewLink({
    //         sourcePostId: '',
    //         targetPostId: '',
    //       }));
    //     }
    //     else if (pendingLink.sourcePostId && pendingLink.targetPostId === props.entry.postId) {
    //       linkPosts();
    //     }

    //     setClickTimeout(null);
    //   }, 400);

    //   setClickTimeout(timeout);
    // }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    // if (pendingLink.sourcePostId && pendingLink.sourcePostId !== props.entry.postId) {
    //   dispatch(setNewLink({
    //     sourcePostId: pendingLink.sourcePostId,
    //     targetPostId: props.entry.postId,
    //   }))
    // }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    // if (pendingLink.sourcePostId && pendingLink.sourcePostId !== props.entry.postId) {
    //   dispatch(setNewLink({
    //     sourcePostId: pendingLink.sourcePostId,
    //     targetPostId: '',
    //   }));
    // }
  }

  if (!arrow) return null;

  const isLinking = false

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
          ? arrow.color
          : null,
        cursor: pendingLink.sourceArrowId
          ? 'crosshair'
          : null, 
        border: width < MOBILE_WIDTH
          ? null
          : arrow.id === selectedTwig.detailId
            ? `2px solid ${arrow.user.color}`
            : null,
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
          fontSize={16}
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
import { useReactiveVar } from '@apollo/client';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { navigateCircleOutline } from 'ionicons/icons';
import React, { createContext, Dispatch, MouseEvent, SetStateAction, TouchList, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { focusAdjustIdToPosVar, focusSpaceElVar, frameAdjustIdToPosVar, frameSpaceElVar } from '../../cache';
import { CLOSED_LINK_TWIG_DIAMETER, MAX_Z_INDEX, TWIG_WIDTH, VIEW_RADIUS } from '../../constants';
import { IdToType } from '../../types';
import { checkPermit } from '../../utils';
import { Arrow } from '../arrow/arrow';
import { selectArrowById } from '../arrow/arrowSlice';
import { selectIdToCursor } from '../cursor/cursorSlice';
import usePublishCursor from '../cursor/usePublishCursor';
import usePublishCursorSub from '../cursor/usePublishCursorSub';
import { Role } from '../role/role';
import { selectFocusTab } from '../tab/tabSlice';
import LinkTwig from '../twig/LinkTwig';
import LinkTwigMarker from '../twig/LinkTwigMarker';
import PostTwig from '../twig/PostTwig';
import PostTwigMarker from '../twig/PostTwigMarker';
import { selectIdToDescIdToTrue, selectIdToTwig } from '../twig/twigSlice';
import useGraftTwig from '../twig/useGraftTwig';
import useGraftTwigSub from '../twig/useGraftTwigSub';
import useLinkTwigSub from '../twig/useLinkTwigSub';
import useMoveTwig from '../twig/useMoveTwig';
import useMoveTwigSub from '../twig/useMoveTwigSub';
import useOpenTwigSub from '../twig/useOpenTwigSub';
import usePasteTwigSub from '../twig/usePasteTwigSub';
import useRemoveTwigSub from '../twig/useRemoveTwigSub';
import useReplyTwigSub from '../twig/useReplyTwigSub';
import useTwigTree from '../twig/useTwigTree';
import RemoveTwigModal from './RemoveTwigModal';
import RolesMenu from './RolesMenu';
import SettingsMenu from './SettingsMenu';
import { PosType, SpaceType } from './space';
import SpaceControls from './SpaceControls';
import SpaceNav from './SpaceNav';
import { mergeIdToPos, moveTwigs, resetSpace, selectCursor, selectDrag, selectIdToHeight, selectIdToPos, selectScale, selectScroll, setCursor, setDrag, setScale, setScroll } from './spaceSlice';
import useInitSpace from './useInitSpace';

export const SpaceContext = createContext({} as {
  abstract: Arrow | null;
  role: Role | null;
  space: SpaceType;
  canView: boolean;
  canPost: boolean;
  canEdit: boolean;
  removalTwigId: string;
  setRemovalTwigId: Dispatch<SetStateAction<string>>;
  touches: TouchList | null;
  setTouches: Dispatch<SetStateAction<TouchList | null>>;
});

interface SpaceComponentProps {
  space: SpaceType;
}

const SpaceComponent = (props: SpaceComponentProps) => {
  const dispatch = useAppDispatch();

  const { moveTwig } = useMoveTwig(props.space);
  const { graftTwig } = useGraftTwig(props.space);


  const { user, palette } = useContext(AppContext);

  const focusTab = useAppSelector(selectFocusTab);

  const abstract = useAppSelector(state => selectArrowById(state, focusTab?.arrowId));
 
  const { publishCursor } = usePublishCursor(props.space, focusTab?.arrowId);

  usePublishCursorSub(props.space, focusTab?.arrowId);

  useReplyTwigSub(props.space, abstract);
  usePasteTwigSub(props.space, abstract);

  useLinkTwigSub(props.space, abstract);

  useMoveTwigSub(props.space, abstract);
  useGraftTwigSub(props.space, abstract);

  useOpenTwigSub(props.space, abstract);

  useRemoveTwigSub(props.space, abstract);

  const scale = useAppSelector(selectScale(props.space));
  const scroll = useAppSelector(selectScroll(props.space));
  const cursor = useAppSelector(selectCursor(props.space));
  const drag = useAppSelector(selectDrag(props.space));

  const idToCursor = useAppSelector(selectIdToCursor(props.space));

  const idToPos = useAppSelector(selectIdToPos(props.space));
  const idToHeight = useAppSelector(selectIdToHeight(props.space));
  const idToTwig = useAppSelector(selectIdToTwig(props.space));
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(props.space))

  const adjustIdToPosDetail = useReactiveVar(props.space === SpaceType.FRAME
    ? frameAdjustIdToPosVar
    : focusAdjustIdToPosVar)

  let role = null as Role | null;
  (abstract?.roles || []).some(role_i => {
    if (role_i.userId === user?.id && !role_i.deleteDate) {
      role = role_i;
      return true;
    }
    return false;
  });

  const canEdit = checkPermit(abstract?.canEdit, role?.type)
  const canPost = checkPermit(abstract?.canPost, role?.type)
  const canView = checkPermit(abstract?.canView, role?.type)

  const spaceEl = useRef<HTMLIonCardElement>(null);
  const settingsMenuRef = useRef<HTMLIonMenuElement>(null);
  const rolesMenuRef = useRef<HTMLIonMenuElement>(null);

  const [touches, setTouches] = useState<TouchList | null>(null);

  const [moveEvent, setMoveEvent] = useState(null as MouseEvent | null);

  const [isScaling, setIsScaling] = useState(false);


  const [shouldLoadTwigPositions, setShouldLoadTwigPositions] = useState(false);

  useTwigTree(props.space);
  useInitSpace(props.space, abstract, setShouldLoadTwigPositions);

  useEffect(() => {
    if (!spaceEl?.current) return;

    if (props.space === SpaceType.FRAME) {
      frameSpaceElVar(spaceEl);
    }
    else {
      focusSpaceElVar(spaceEl);
    }

    const preventWheelDefault = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    }

    spaceEl.current.addEventListener('wheel', preventWheelDefault);

    return () => {
      spaceEl.current?.removeEventListener('wheel', preventWheelDefault);
    }
  }, [spaceEl?.current]);

  useEffect(() => {
    if (!shouldLoadTwigPositions) return;
    
    setShouldLoadTwigPositions(false);

    dispatch(resetSpace(props.space));

    const idToPos1 = Object.keys(idToTwig).reduce((acc: IdToType<PosType>, twigId) => {
      const twig = idToTwig[twigId];
      acc[twigId] = {
        x: twig.x,
        y: twig.y,
      };
      return acc;
    }, {});

    if (Object.keys(idToPos1).length) {
      dispatch(mergeIdToPos({
        space: props.space,
        idToPos: idToPos1,
      }));
    }

  }, [shouldLoadTwigPositions, idToTwig]);

  const [removalTwigId, setRemovalTwigId] = useState('');

  const spaceContextValue = useMemo(() => {
    return {
      abstract,
      role,
      space: props.space,
      canView,
      canPost, 
      canEdit,
      removalTwigId, 
      setRemovalTwigId,
      touches,
      setTouches,
    };
  }, [abstract, role, props.space, canView, canPost, canEdit, removalTwigId]);

  const moveDrag = (dx: number, dy: number) => {
    if (drag.isScreen) {
      return;
    }

    if (!drag.twigId) return;

    const dx1 = dx / scale;
    const dy1 = dy / scale;

    dispatch(moveTwigs({
      space: props.space,
      twigIds: [
        drag.twigId,
        ...Object.keys(idToDescIdToTrue[drag.twigId] || {}),
      ],
      dx: dx1,
      dy: dy1,
    }));

    if (canEdit) {
      //dragTwig(drag.twigId, dx1, dy1);
    }
  };

  useEffect(() => {
    if (!moveEvent || !spaceEl?.current) return;

    const x = spaceEl.current.scrollLeft + moveEvent.clientX;
    const y = spaceEl.current.scrollTop + moveEvent.clientY;

    const dx = x - cursor.x;
    const dy = y - cursor.y;

    moveDrag(dx, dy);
    
    dispatch(setCursor({
      space: props.space,
      cursor: {
        x,
        y,
      },
    }));

    publishCursor(x, y);

    setMoveEvent(null);
  }, [moveEvent, cursor]);

  useEffect(() => {
    if (Object.keys(adjustIdToPosDetail).length) {
      dispatch(mergeIdToPos({
        space: props.space,
        idToPos: adjustIdToPosDetail,
      }));
    }
  }, [adjustIdToPosDetail])

  const updateScroll = (left: number, top: number) => {
    dispatch(setScroll({
      space: props.space,
      scroll: {
        left,
        top,
      },
    }));

    const dx = left - scroll.left;
    const dy = top - scroll.top;

    dispatch(setCursor({
      space: props.space,
      cursor: {
        x: cursor.x + dx,
        y: cursor.y + dy,
      },
    }));
  }

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (!spaceEl.current) return;

      const { scrollLeft, scrollTop } = spaceEl.current;

      if (scroll.left !== scrollLeft || scroll.top !== scrollTop) {
        spaceEl.current.scrollTo({
          left: scroll.left,
          top: scroll.top,
        });
      }

      const center = {
        x: cursor.x / scale,
        y: cursor.y / scale,
      };

      const scale1 = Math.min(Math.max(.03125, scale + event.deltaY * -0.004), 4)

      const left =  Math.round((center.x * scale1) - (event.clientX));
      const top = Math.round(center.y * scale1 - (event.clientY));
      
      spaceEl.current.scrollTo({
        left,
        top,
      });

      setIsScaling(true);
      updateScroll(left, top)
      dispatch(setScale({
        space: props.space,
        scale: scale1
      }));
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: true,
        twigId: '',
        targetTwigId: '',
      }
    }));
  }

  const endDrag = () => {
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: false,
        twigId: '',
        targetTwigId: '',
      }
    }));

    if (!drag.twigId) return;

    if (canEdit) {
      const pos = idToPos[drag.twigId]
      if (drag.targetTwigId) {
        graftTwig(drag.twigId, drag.targetTwigId, pos.x, pos.y);
      }
      else {
        moveTwig(drag.twigId, pos.x, pos.y);
      }
    }
    else {
      // dispatch(setFocusIsSynced(false));
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    endDrag()
  }

  const handleMouseMove = (event: React.MouseEvent, targetId?: string) => {
    if (drag.isScreen || drag.twigId) {
      event.preventDefault();
    }
    if (!targetId && drag.targetTwigId && !drag.isScreen) {
      dispatch(setDrag({
        space: props.space,
        drag: {
          ...drag,
          targetTwigId: '',
        },
      }));
    }
    if (drag.isScreen) {
      if (!spaceEl?.current) return;
      spaceEl.current.scrollBy(-1 * event.movementX, -1 * event.movementY)
      return;
    }

    if (!moveEvent) {
      setMoveEvent(event);
    }
  }

  const handleTargetMouseMove = (targetId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (drag.targetTwigId !== targetId) {
      dispatch(setDrag({
        space: props.space,
        drag: {
          ...drag,
          targetTwigId: targetId,
        },
      }));
    }
    handleMouseMove(event, targetId);
  }

  const handleScroll = (event: React.UIEvent) => {
    if (isScaling) {
      setIsScaling(false);
    }
    else {
      updateScroll(event.currentTarget.scrollLeft, event.currentTarget.scrollTop);
    }
  }

 
  const handleTouchMove = (event: React.TouchEvent) => {
    console.log('touchMove');
    setTouches(event.touches);

    if (!touches) return;

    if (event.touches.length > 1 && touches.length > 1 && false) {
      /* TODO mobile touch zoom
      event.preventDefault();
      event.stopPropagation();

      if (!spaceEl.current) return;
    
      const dx1 = event.touches.item(0).clientX - event.touches.item(1).clientX;
      const dy1 = event.touches.item(0).clientY - event.touches.item(1).clientY;
      const currDiff = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));

      const dx0 = touches.item(0).clientX - touches.item(1).clientX;
      const dy0 = touches.item(0).clientY - touches.item(1).clientY;
      const prevDiff = Math.sqrt(Math.pow(dx0, 2) + Math.pow(dy0, 2));

      const clientX = (event.touches.item(0).clientX + event.touches.item(1).clientX) / 2;
      const clientY = (event.touches.item(0).clientY + event.touches.item(1).clientY) / 2;
      const x = props.space === 'FRAME'
        ? clientX + scroll.left - getAppbarWidth(width) - surveyorWidth1 - focusWidth1
        : clientX + scroll.left - getAppbarWidth(width) - surveyorWidth1;
      const y = clientY + scroll.top - SPACE_BAR_HEIGHT;

      if (Math.abs(currDiff - prevDiff) < 10) return;

      const scalar = currDiff < prevDiff
        ? 1
        : -1;
        
      const center = {
        x: x / scale,
        y: y / scale,
      };

      const scale1 = Math.min(Math.max(.03125, scale + scalar * -0.08), 4)

      const left = props.space === 'FRAME'
        ? (center.x * scale1) - (clientX - getAppbarWidth(width) - surveyorWidth1 - focusWidth1)
        : (center.x * scale1) - (clientX - getAppbarWidth(width) - surveyorWidth1);
      const top = center.y * scale1 - (clientY - SPACE_BAR_HEIGHT);
      
      spaceEl.current.scrollTo({
        left,
        top,
      });

      setIsScaling(true);
      updateScroll(left, top)
      dispatch(setScale(scale1));*/
    }
    else if (drag.twigId) {
      const current = event.touches.item(0);
      const dx = Math.round(current.clientX - touches.item(0).clientX);
      const dy = Math.round(current.clientY - touches.item(0).clientY);

      const pos = idToPos[drag.twigId];

      let targetTwigId = '';
      Object.keys(idToTwig).some(twigId => {
        const targetTwig = idToTwig[twigId];
        const targetPos = idToPos[twigId];
        const targetHeight = idToHeight[twigId];

        if (
          !targetTwig.deleteDate &&
          pos.x > targetPos.x &&
          pos.y > targetPos.y &&
          pos.x < targetPos.x + TWIG_WIDTH &&
          pos.y < targetPos.y + targetHeight
        ) {
          targetTwigId = twigId
        }
        return !!targetTwigId;
      })

      if (targetTwigId !== drag.targetTwigId) {
        if (targetTwigId) {
          dispatch(setDrag({
            space: props.space,
            drag: {
              ...drag,
              targetTwigId,
            },
          }));
        }
        else {
          dispatch(setDrag({
            space: props.space,
            drag: {
              ...drag,
              targetTwigId: '',
            },
          }));
        }
      }

      moveDrag(dx, dy)
    }

   
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    console.log('touchEnd');
    endDrag();
  }


  const twigMarkers: JSX.Element[] = [];
  const twigs: JSX.Element[] = [];

  const dropTargets: JSX.Element[] = [];

  const idToPos1: IdToType<PosType> = {};


  Object.keys(idToTwig).forEach(twigId => {
    const twig = idToTwig[twigId];
    const pos = idToPos[twigId];

    if (!twig || twig.deleteDate || !pos) return;
    if (twig.abstractId !== abstract?.id) return;

    const parentTwig = idToTwig[twig.parent?.id];

    if (parentTwig && !parentTwig.deleteDate) {
      const parentPos = idToPos[twig.parent.id];

      if (
        parentPos &&
        (pos.x !== 0 && pos.y !== 0)
      ) {
        twigMarkers.push(
          <PostTwigMarker
            key={`post-twig-marker-${twigId}`}
            twig={twig}
            pos={pos}
            parentPos={parentPos}
          />
        );
      }
    }


    if (
      drag.twigId &&
      twig.id !== drag.twigId && 
      !Object.keys(idToDescIdToTrue[drag.twigId] || {}).some(descId => descId === twig.id) &&
      twig.sourceId !== drag.twigId &&
      twig.targetId !== drag.twigId &&
      twig.id !== idToTwig[drag.twigId].parent?.id
    ) {
      dropTargets.push(
        <div 
          key={'twig-droptarget-' + twig.id} 
          onMouseMove={handleTargetMouseMove(twig.id)} 
          style={{
            position: 'absolute',
            left: pos.x + VIEW_RADIUS + 10,
            top: pos.y + VIEW_RADIUS + 10,
            zIndex: MAX_Z_INDEX + twig.z,
            width: twig.isOpen
              ? TWIG_WIDTH
              : CLOSED_LINK_TWIG_DIAMETER,
            height: twig.isOpen
              ? idToHeight[twig.id]
              : CLOSED_LINK_TWIG_DIAMETER,
            backgroundColor: twig.user?.color,
            opacity: drag.targetTwigId === twig.id
              ? 0.5
              : 0,
            borderRadius: 10,
            border: `2px solid ${twig.user.color}`,
          }}
        />
      );
    }

    if (twig.sourceId !== twig.targetId) {
      const sourceTwig = twig.sourceId
        ? idToTwig[twig.sourceId]
        : null;
      const targetTwig = twig.targetId
        ? idToTwig[twig.targetId]
        : null;

      if (
        !sourceTwig || 
        sourceTwig.deleteDate || 
        !targetTwig || 
        targetTwig.deleteDate
      ) return;

      const sourcePos = twig.sourceId
        ? idToPos[twig.sourceId]
        : null;
      const targetPos = twig.targetId
        ? idToPos[twig.targetId]
        : null;

      const x = Math.round(((sourcePos?.x ?? 0) + (targetPos?.x ?? 0)) / 2);
      const y = Math.round(((sourcePos?.y ?? 0) + (targetPos?.y ?? 0)) / 2);

      if (x !== pos.x || y !== pos.y) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        [
          twigId, 
          ...Object.keys(idToDescIdToTrue[twigId] || {})
        ].forEach(descId => {
          const descPos = idToPos[descId];

          idToPos1[descId] = {
            x: descPos.x + dx,
            y: descPos.y + dy,
          }
        })
      }
      twigs.push(
        <div key={`twig-${twigId}`} style={{
          position: 'absolute',
          left: x + VIEW_RADIUS,
          top: y + VIEW_RADIUS,
          zIndex: twig.z,
          pointerEvents: 'none',
        }}>
          <LinkTwig twigId={twig.id} />
        </div>
      );

      twigMarkers.push(
        <LinkTwigMarker
          key={`link-twig-marker-${twigId}`}
          twig={twig}
          sourcePos={sourcePos}
          targetPos={targetPos}
        />
      );
    }
    else {
      twigs.push(
        <div key={`twig-${twigId}`} style={{
          position: 'absolute',
          left: pos.x + VIEW_RADIUS,
          top: pos.y + VIEW_RADIUS,
          zIndex: twig.z,
          pointerEvents: 'none',
        }}>
          <PostTwig twigId={twig.id} />
        </div>
      );
    }
  });

  if (Object.keys(idToPos1).length) {
    if (props.space === SpaceType.FRAME) {
      frameAdjustIdToPosVar(idToPos1);
    }
    else {
      focusAdjustIdToPosVar(idToPos1);
    }
  }


  return (
    <SpaceContext.Provider value={spaceContextValue}>
      <IonCard ref={spaceEl} 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onScroll={handleScroll}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          margin: 0,
          top: 44,
          width: '100%',
          height: 'calc(100% - 44px)',
          overflow:'scroll',
          backgroundColor: palette === 'dark'
            ? '#000000'
            : '#e0e0e0',
          borderRadius: 0,
          cursor: drag.isScreen || drag.twigId
            ? 'grabbing'
            : 'grab',
          position: 'relative',
        }}
      >
        <IonCardContent style={{
          width: VIEW_RADIUS * 2 * (scale < 1 ? scale : 1),
          height: VIEW_RADIUS * 2 * (scale < 1 ? scale : 1),
          transform: `scale(${scale})`,
          transformOrigin: '0 0'
        }}>
          <svg viewBox={`0 0 ${VIEW_RADIUS * 2} ${VIEW_RADIUS * 2}`} style={{
            width: VIEW_RADIUS * 2,
            height: VIEW_RADIUS * 2,
          }}>
            {
              twigMarkers
            }
          </svg>
          { twigs }
          { dropTargets }
        </IonCardContent>
        {
          Object.keys(idToCursor).map(id => {
            const cursor = idToCursor[id];
            return (
              <div key={`cursor-${id}`} style={{
                position: 'absolute',
                left: (cursor.x * scale) - 10,
                top: (cursor.y * scale) - 60,
                zIndex: MAX_Z_INDEX + 10000,
                color: cursor.color,
                display: 'flex',
                fontSize: 20,
              }}>
                <IonIcon icon={navigateCircleOutline} size='large'/>
                {cursor.name}
              </div>
            )
          })
        }
      </IonCard>
      <SpaceControls 
        settingsMenuRef={settingsMenuRef}
        rolesMenuRef={rolesMenuRef}
      />
      <SpaceNav />
      <SettingsMenu 
        settingsMenuRef={settingsMenuRef}
      />
      <RolesMenu
        rolesMenuRef={rolesMenuRef}
      />
      <RemoveTwigModal />
    </SpaceContext.Provider>
  );
};

export default SpaceComponent;

import { useReactiveVar } from '@apollo/client';
import { IonCard, IonCardContent } from '@ionic/react';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { focusAdjustIdToPosVar, focusSpaceElVar, frameAdjustIdToPosVar, frameSpaceElVar } from '../../cache';
import { CLOSED_LINK_TWIG_DIAMETER, MAX_Z_INDEX, TWIG_WIDTH, VIEW_RADIUS } from '../../constants';
import { IdToType } from '../../types';
import { checkPermit } from '../../utils';
import { Arrow } from '../arrow/arrow';
import { selectArrowById } from '../arrow/arrowSlice';
import { Role } from '../role/role';
import { selectFocusTab } from '../tab/tabSlice';
import LinkTwig from '../twig/LinkTwig';
import LinkTwigMarker from '../twig/LinkTwigMarker';
import PostTwig from '../twig/PostTwig';
import PostTwigMarker from '../twig/PostTwigMarker';
import { selectIdToDescIdToTrue, selectIdToTwig } from '../twig/twigSlice';
import useGraftTwig from '../twig/useGraftTwig';
import useMoveTwig from '../twig/useMoveTwig';
import useTwigTree from '../twig/useTwigTree';
import RemoveTwigModal from './RemoveTwigModal';
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
 
  const scale = useAppSelector(selectScale(props.space));
  const scroll = useAppSelector(selectScroll(props.space));
  const cursor = useAppSelector(selectCursor(props.space));
  const drag = useAppSelector(selectDrag(props.space));

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

  const settingsMenuRef = useRef<HTMLIonMenuElement>(null);

  const [showRoles, setShowRoles] = useState(false);

  const [moveEvent, setMoveEvent] = useState(null as React.MouseEvent | null);

  const [isScaling, setIsScaling] = useState(false);

  const spaceEl = useRef<HTMLIonCardElement>(null);

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
    };
  }, [abstract, role, props.space, canView, canPost, canEdit, removalTwigId]);

  const moveDrag = (dx: number, dy: number, targetTwigId?: string) => {
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

    //publishCursor(x, y); TODO

    setMoveEvent(null);
  }, [moveEvent]);

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
      if (drag.targetTwigId) {
        graftTwig(drag.twigId, drag.targetTwigId);
      }
      else {
        const pos = idToPos[drag.twigId]
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
            left: pos.x + VIEW_RADIUS,
            top: pos.y + VIEW_RADIUS,
            zIndex: MAX_Z_INDEX + twig.z,
            width: twig.isOpen
              ? TWIG_WIDTH
              : CLOSED_LINK_TWIG_DIAMETER,
            height: twig.isOpen
              ? idToHeight[twig.id]
              : CLOSED_LINK_TWIG_DIAMETER,
            backgroundColor: twig.user?.color,
            opacity: drag.targetTwigId === twig.id
              ? 0.4
              : 0,
            borderRadius: 2,
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
      }}>
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
      </IonCard>
      <SpaceControls 
        settingsMenuRef={settingsMenuRef}
        showRoles={showRoles}
        setShowRoles={setShowRoles}
      />
      <SpaceNav />
      <SettingsMenu 
        settingsMenuRef={settingsMenuRef}
      />
      <RemoveTwigModal />
    </SpaceContext.Provider>
  );
};

export default SpaceComponent;

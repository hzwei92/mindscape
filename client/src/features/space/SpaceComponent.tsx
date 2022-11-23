import { useReactiveVar } from '@apollo/client';
import { IonCard, IonIcon } from '@ionic/react';
import { navigateCircleOutline } from 'ionicons/icons';
import React, { createContext, Dispatch, memo, MouseEvent, SetStateAction, TouchList, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { adjustTwigIdToPosVar, spaceElVar } from '../../cache';
import { CLOSED_LINK_TWIG_DIAMETER, MAX_Z_INDEX, OFF_WHITE, TWIG_WIDTH, VIEW_RADIUS } from '../../constants';
import { IdToType } from '../../types';
import { checkPermit } from '../../utils';
import { Arrow } from '../arrow/arrow';
import { selectArrowById } from '../arrow/arrowSlice';
import { MenuMode } from '../menu/menu';
import { Role } from '../role/role';
import { selectIdToRole } from '../role/roleSlice';
import LinkTwig from '../twig/LinkTwig';
import LinkTwigMarker from '../twig/LinkTwigMarker';
import PostTwig from '../twig/PostTwig';
import PostTwigMarker from '../twig/PostTwigMarker';
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
import RolesModal from './RolesModal';
import SettingsModal from './SettingsModal';
import { PosType } from './space';
import SpaceControls from './SpaceControls';
import SpaceNav from './SpaceNav';
import { mergeIdToPos, moveTwigs, selectAbstractIdToData, selectCursor, selectDrag, selectIdToAvatar, selectIdToDescIdToTrue, selectIdToHeight, selectIdToPos, selectIdToTwig, selectScale, selectScroll, setCursor, setDrag, setScale, setScroll } from './spaceSlice';
import useInitSpace from './useInitSpace';
import usePublishAvatar from './usePublishAvatar';
import usePublishAvatarSub from './usePublishAvatarSub';

export const SpaceContext = createContext({} as {
  abstractId: string;
  abstract: Arrow | null;
  role: Role | null;
  canView: boolean;
  canPost: boolean;
  canEdit: boolean;
  removalTwigId: string;
  setRemovalTwigId: Dispatch<SetStateAction<string>>;
  touches: TouchList | null;
  setTouches: Dispatch<SetStateAction<TouchList | null>>;
});

interface SpaceComponentProps {
  abstractId: string;
  left: number;
  right: number;
}

const SpaceComponent = (props: SpaceComponentProps) => {
  const dispatch = useAppDispatch();

  const { user, palette, menuX, menuMode } = useContext(AppContext);
 
  useInitSpace(props.abstractId);
  useTwigTree(props.abstractId);

  usePublishAvatarSub(props.abstractId);

  useReplyTwigSub(props.abstractId);
  usePasteTwigSub(props.abstractId);

  useLinkTwigSub(props.abstractId);

  useMoveTwigSub(props.abstractId);
  useGraftTwigSub(props.abstractId);

  useOpenTwigSub(props.abstractId);

  useRemoveTwigSub(props.abstractId);

  const { publishAvatar } = usePublishAvatar(props.abstractId);
  const { moveTwig } = useMoveTwig(props.abstractId);
  const { graftTwig } = useGraftTwig(props.abstractId);

  
  const adjustTwigIdToPos = useReactiveVar(adjustTwigIdToPosVar); 

  const idToRole = useAppSelector(selectIdToRole);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const {
    scale,
    scroll,
    cursor,
    drag,
    idToTwig,
    idToPos,
    idToHeight,
    idToDescIdToTrue,
    idToAvatar,
  } = abstractIdToData[props.abstractId] ?? {};

  const abstract = useAppSelector(state => selectArrowById(state, props.abstractId));

  let role = null as Role | null;
  (abstract?.roles || []).some(role_i => {
    if (role_i.userId === user?.id && !role_i.deleteDate) {
      role = idToRole[role_i.id];
      return true;
    }
    return false;
  });

  const canEdit = abstract?.userId === user?.id || checkPermit(abstract?.canEdit, role?.type)
  const canPost = abstract?.userId === user?.id || checkPermit(abstract?.canPost, role?.type)
  const canView = abstract?.userId === user?.id || checkPermit(abstract?.canView, role?.type)

  const spaceEl = useRef<HTMLIonCardElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const [touches, setTouches] = useState<TouchList | null>(null);

  const [moveEvent, setMoveEvent] = useState(null as MouseEvent | null);

  const [isScaling, setIsScaling] = useState(false);


  useEffect(() => {
    if (!spaceEl?.current) return;

    spaceElVar(spaceEl);

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

  const [removalTwigId, setRemovalTwigId] = useState('');

  const spaceContextValue = useMemo(() => {
    return {
      abstractId: props.abstractId,
      abstract,
      role,
      canView,
      canPost, 
      canEdit,
      removalTwigId, 
      setRemovalTwigId,
      touches,
      setTouches,
    };
  }, [props.abstractId, abstract, role, canView, canPost, canEdit, removalTwigId, touches]);

  const moveDrag = (dx: number, dy: number) => {
    if (drag?.isScreen) {
      return;
    }

    if (!drag?.twigId) return;

    const dx1 = dx / scale;
    const dy1 = dy / scale;

    dispatch(moveTwigs({
      abstractId: props.abstractId,
      twigIds: [
        drag?.twigId,
        ...Object.keys(idToDescIdToTrue[drag?.twigId] || {}),
      ],
      dx: dx1,
      dy: dy1,
    }));
  };

  useEffect(() => {
    if (!moveEvent || !spaceEl?.current) return;
    const x = spaceEl.current.scrollLeft + moveEvent.clientX;
    const y = spaceEl.current.scrollTop + moveEvent.clientY;

    const dx = x - (cursor?.x ?? 0);
    const dy = y - (cursor?.y ?? 0);

    moveDrag(dx, dy);
    
    dispatch(setCursor({
      abstractId: props.abstractId,
      cursor: {
        x,
        y,
      },
    }));

    publishAvatar(x, y);

    setMoveEvent(null);
  }, [moveEvent, cursor]);

  useEffect(() => {
    if (Object.keys(adjustTwigIdToPos).length) {
      dispatch(mergeIdToPos({
        abstractId: props.abstractId,
        idToPos: adjustTwigIdToPos,
      }));
    }
  }, [adjustTwigIdToPos]);

  const updateScroll = (left: number, top: number) => {
    dispatch(setScroll({
      abstractId: props.abstractId,
      scroll: {
        left,
        top,
      },
    }));

    const dx = left - scroll.left;
    const dy = top - scroll.top;

    dispatch(setCursor({
      abstractId: props.abstractId,
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
        x: (cursor.x - (menuMode === MenuMode.NONE ? 0 : menuX) - 50) / scale,
        y: (cursor.y - 32) / scale,
      };

      const scale1 = Math.min(Math.max(.03125, scale + event.deltaY * -0.004), 4)

      const left =  Math.round((center.x * scale1) - (event.clientX - (menuMode === MenuMode.NONE ? 0 : menuX) - 50));
      const top = Math.round(center.y * scale1 - (event.clientY - 32));
      
      spaceEl.current.scrollTo({
        left,
        top,
      });

      setIsScaling(true);
      updateScroll(left, top)
      dispatch(setScale({
        abstractId: props.abstractId,
        scale: scale1
      }));
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    dispatch(setDrag({
      abstractId: props.abstractId,
      drag: {
        isScreen: true,
        twigId: '',
        targetTwigId: '',
      }
    }));
  }

  const endDrag = () => {
    dispatch(setDrag({
      abstractId: props.abstractId,
      drag: {
        isScreen: false,
        twigId: '',
        targetTwigId: '',
      }
    }));

    if (!drag?.twigId) return;

    if (canEdit) {
      const pos = idToPos[drag?.twigId]
      if (drag?.targetTwigId) {
        graftTwig(drag?.twigId, drag?.targetTwigId, pos.x, pos.y);
      }
      else {
        moveTwig(drag?.twigId, pos.x, pos.y);
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
    if (drag?.isScreen || drag?.twigId) {
      event.preventDefault();
    }
    if (!targetId && drag?.targetTwigId && !drag?.isScreen) {
      dispatch(setDrag({
        abstractId: props.abstractId,
        drag: {
          ...drag,
          targetTwigId: '',
        },
      }));
    }
    if (drag?.isScreen) {
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
    if (drag?.targetTwigId !== targetId) {
      dispatch(setDrag({
        abstractId: props.abstractId,
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
    else if (drag?.twigId) {
      const current = event.touches.item(0);
      const dx = Math.round(current.clientX - touches.item(0).clientX);
      const dy = Math.round(current.clientY - touches.item(0).clientY);

      const pos = idToPos[drag?.twigId];

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

      if (targetTwigId !== drag?.targetTwigId) {
        if (targetTwigId) {
          dispatch(setDrag({
            abstractId: props.abstractId,
            drag: {
              ...drag,
              targetTwigId,
            },
          }));
        }
        else {
          dispatch(setDrag({
            abstractId: props.abstractId,
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


  Object.keys(idToTwig || {}).forEach(twigId => {
    const twig = idToTwig[twigId];
    const pos = (idToPos ?? {})[twigId];

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
      drag?.twigId &&
      twig.id !== drag?.twigId && 
      !Object.keys(idToDescIdToTrue[drag?.twigId] || {}).some(descId => descId === twig.id) &&
      twig.sourceId !== drag?.twigId &&
      twig.targetId !== drag?.twigId &&
      twig.id !== idToTwig[drag?.twigId].parent?.id
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
            width: twig.isOpen || twig.sourceId === twig.targetId
              ? TWIG_WIDTH
              : CLOSED_LINK_TWIG_DIAMETER,
            height: twig.isOpen || twig.sourceId === twig.targetId
              ? idToHeight[twig.id]
              : CLOSED_LINK_TWIG_DIAMETER,
            backgroundColor: twig.user?.color,
            opacity: drag?.targetTwigId === twig.id
              ? 0.5
              : 0.5,
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
    adjustTwigIdToPosVar(idToPos1);
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
          padding: 0,
          height: '100%',
          width: '100%',
          overflow:'scroll',
          backgroundColor: palette === 'dark'
            ? '#000000'
            : OFF_WHITE,
          borderRadius: 0,
          cursor: drag?.isScreen || drag?.twigId
            ? 'grabbing'
            : 'grab',
          position: 'relative',
        }}
      >
        <div style={{
          width: VIEW_RADIUS * 2 * (scale < 1 ? scale : 1),
          height: VIEW_RADIUS * 2 * (scale < 1 ? scale : 1),
          //zoom: scale,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
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
        </div>
        {
          Object.keys(idToAvatar || {}).map(id => {
            const avatar = idToAvatar[id];
            return (
              <div key={`cursor-${id}`} style={{
                position: 'absolute',
                left: (avatar.x * scale) - 10,
                top: (avatar.y * scale) - 60,
                zIndex: MAX_Z_INDEX + 10000,
                color: avatar.color,
                display: 'flex',
                fontSize: 20,
              }}>
                <IonIcon icon={navigateCircleOutline} size='large'/>
                {avatar.name}
              </div>
            )
          })
        }
      </IonCard>
      <SpaceControls 
        setShowRoles={setShowRoles}
        setShowSettings={setShowSettings}
      />
      <SpaceNav />
      <SettingsModal 
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />
      <RolesModal
        showRoles={showRoles}
        setShowRoles={setShowRoles}
      />
      <RemoveTwigModal />
    </SpaceContext.Provider>
  );
};

export default memo(SpaceComponent);

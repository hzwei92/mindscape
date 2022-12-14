import { IonCard, IonIcon, useIonToast } from '@ionic/react';
import { navigateCircleOutline } from 'ionicons/icons';
import React, { createContext, Dispatch, memo, MouseEvent, SetStateAction, TouchList, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { adjustTwigIdToPosVar } from '../../cache';
import { APP_BAR_X, CLOSED_LINK_TWIG_DIAMETER, MAX_Z_INDEX, OFF_WHITE, SCROLL_SENSITIVITY, TAB_HEIGHT, TWIG_WIDTH, VIEW_RADIUS } from '../../constants';
import { IdToType } from '../../types';
import { checkPermit } from '../../utils';
import { Arrow } from '../arrow/arrow';
import { selectArrowById } from '../arrow/arrowSlice';
import { MenuMode } from '../menu/menu';
import { Role } from '../role/role';
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
import ReplyTwigModal from './ReplyTwigModal';
import SettingsModal from './SettingsPanel';
import { PosType } from './space';
import SpaceControls from './SpaceControls';
import SpaceNav from './SpaceNav';
import { moveTwigs, selectAbstractIdToData, selectCursor, selectDrag, setCursor, setDrag } from './spaceSlice';
import useInitSpace from './useInitSpace';
import usePublishAvatar from '../explorer/usePublishAvatar';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export const SpaceContext = createContext({} as {
  abstractId: string;
  abstract: Arrow | null;
  role: Role | null;
  canView: boolean;
  canPost: boolean;
  canEdit: boolean;

  removalTwigId: string;
  setRemovalTwigId: Dispatch<SetStateAction<string>>;
  showRemoveTwigModal: boolean;
  setShowRemoveTwigModal: Dispatch<SetStateAction<boolean>>;

  replyTwigId: string;
  setReplyTwigId: Dispatch<SetStateAction<string>>;
  showReplyTwigModal: boolean;
  setShowReplyTwigModal: Dispatch<SetStateAction<boolean>>;

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
  
  const [present] = useIonToast();

  const { user, palette, menuX, menuMode, spaceRef } = useContext(AppContext);
 
  const [isSynced, setIsSynced] = useState(true);

  useInitSpace(props.abstractId, isSynced, setIsSynced);
  useTwigTree(props.abstractId);

  useReplyTwigSub(props.abstractId);
  usePasteTwigSub(props.abstractId);

  useLinkTwigSub(props.abstractId);

  useMoveTwigSub(props.abstractId);
  useGraftTwigSub(props.abstractId);

  useOpenTwigSub(props.abstractId);

  useRemoveTwigSub(props.abstractId);

  const { publishAvatar } = usePublishAvatar();
  const { moveTwig } = useMoveTwig(props.abstractId);
  const { graftTwig } = useGraftTwig(props.abstractId);

  const cursor = useAppSelector(selectCursor);
  const drag = useAppSelector(selectDrag);

  const abstractIdToData = useAppSelector(selectAbstractIdToData);

  const {
    idToTwig,
    idToPos,
    idToHeight,
    idToDescIdToTrue,
    idToAvatar,
    idToRole,
    selectedTwigId,
  } = abstractIdToData[props.abstractId];

  const abstract = useAppSelector(state => selectArrowById(state, props.abstractId));

  let role = null as Role | null;
  Object.values(idToRole).some(role_i => {
    if (role_i.userId === user?.id && !role_i.deleteDate) {
      role = idToRole[role_i.id];
      return true;
    }
    return false;
  });

  const canEdit = abstract?.userId === user?.id || checkPermit(abstract?.canEditLayout, role?.type)
  const canPost = abstract?.userId === user?.id || checkPermit(abstract?.canPost, role?.type)
  const canView = abstract?.userId === user?.id || checkPermit(abstract?.canView, role?.type)

  const spaceEl = useRef<HTMLIonCardElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const [touches, setTouches] = useState<TouchList | null>(null);

  const [moveEvent, setMoveEvent] = useState(null as MouseEvent | null);

  const [removalTwigId, setRemovalTwigId] = useState('');
  const [showRemoveTwigModal, setShowRemoveTwigModal] = useState(false);

  const [replyTwigId, setReplyTwigId] = useState('');
  const [showReplyTwigModal, setShowReplyTwigModal] = useState(false);

  const [adjustPosTwigIds, setAdjustPosTwigIds] = useState<string[]>([]);

  const [adjustCount, setAdjustCount] = useState(0);

  useEffect(() => {
    if (selectedTwigId) {
      spaceRef.current?.zoomToElement('twig-'+ selectedTwigId, 1.2, 200);
    }
  }, [selectedTwigId]);

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
      showRemoveTwigModal,
      setShowRemoveTwigModal,

      replyTwigId,
      setReplyTwigId,
      showReplyTwigModal,
      setShowReplyTwigModal,

      touches,
      setTouches,
    };
  }, [
    props.abstractId, 
    abstract, 
    role, 
    canView, canPost, canEdit, 
    removalTwigId, showRemoveTwigModal, 
    replyTwigId, showReplyTwigModal,
    touches
  ]);

  useEffect(() => {
    if (!moveEvent || !spaceEl.current || !spaceRef.current) return;

    const {
      positionX,
      positionY,
      scale,
    } = spaceRef.current.state;

    const x = (moveEvent.clientX - (menuMode === MenuMode.NONE ? APP_BAR_X : menuX) - positionX) / scale;
    const y = (moveEvent.clientY - TAB_HEIGHT - positionY) / scale;
  
    dispatch(setCursor({
      x,
      y,
    }));

    const dx = x - (cursor?.x ?? 0);
    const dy = y - (cursor?.y ?? 0);

    if (drag?.twigId) {
      dispatch(moveTwigs({
        abstractId: props.abstractId,
        twigIds: [
          drag?.twigId,
          ...Object.keys(idToDescIdToTrue[drag?.twigId] || {}),
        ],
        dx,
        dy,
      }));
    }

    if (dx > 0 || dy > 0) {
      publishAvatar(props.abstractId, x, y); 
    }

    setMoveEvent(null);
  }, [moveEvent, cursor]);

  useEffect(() => {
    let found = false;
    if (adjustCount > 20) {
      setAdjustCount(0);
      return;
    }
    Object.keys(idToPos).forEach(twigId => {
      const twig = idToTwig[twigId];
      if (!twig?.sourceId || !twig?.targetId || twig.sourceId === twig.targetId) return;

      const pos = idToPos[twigId];
      const sourcePos = idToPos[twig.sourceId];
      const targetPos = idToPos[twig.targetId];

      if (
        !sourcePos || 
        !targetPos || 
        sourcePos.x > VIEW_RADIUS ||
        sourcePos.x < -1 * VIEW_RADIUS ||
        sourcePos.y > VIEW_RADIUS || 
        sourcePos.y < -1 * VIEW_RADIUS ||
        targetPos.x > VIEW_RADIUS || 
        targetPos.x < -1 * VIEW_RADIUS ||
        targetPos.y > VIEW_RADIUS ||
        targetPos.y < -1 * VIEW_RADIUS
      ) return

      const x = Math.round(((sourcePos?.x ?? 0) + (targetPos?.x ?? 0)) / 2);
      const y = Math.round(((sourcePos?.y ?? 0) + (targetPos?.y ?? 0)) / 2);

      if (pos.x !== x || pos.y !== y) {
        found = true;
        const twigIds = [
          twigId,
          ...Object.keys(idToDescIdToTrue[twigId] || {}),
        ];

        setAdjustPosTwigIds(ids => [...ids, ...twigIds]);

        dispatch(moveTwigs({
          abstractId: props.abstractId,
          twigIds: [
            twigId,
            ...Object.keys(idToDescIdToTrue[twigId] || {}),
          ],
          dx: x - pos.x,
          dy: y - pos.y,
        }));
      }
    });
    if (found) {
      setAdjustCount(val => val + 1);
    }
    else {
      setAdjustCount(0);
    }
  }, [idToPos, adjustPosTwigIds])

  const handleMouseDown = (event: React.MouseEvent) => {
    dispatch(setDrag({
      isScreen: true,
      twigId: '',
      targetTwigId: '',
    }));
  }

  const endDrag = () => {
    dispatch(setDrag({
      isScreen: false,
      twigId: '',
      targetTwigId: '',
    }));

    if (!drag?.twigId) return;

    if (canEdit || idToTwig[drag.twigId].userId === user?.id) {
      const pos = idToPos[drag?.twigId]
      if (drag?.targetTwigId) {
        graftTwig(drag?.twigId, drag?.targetTwigId, pos.x, pos.y);
      }
      else {
        moveTwig(drag?.twigId, pos.x, pos.y, adjustPosTwigIds);

        setAdjustPosTwigIds([]);
      }
    }
    else {
      setIsSynced(false)
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
        ...drag,
        targetTwigId: '',
      }));
    }
    if (!moveEvent) {
      setMoveEvent(event);
    }
  }

  const handleTargetMouseMove = (targetId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (drag?.targetTwigId !== targetId) {
      dispatch(setDrag({
        ...drag,
        targetTwigId: targetId,
      }));
    }
    handleMouseMove(event, targetId);
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouches(event.touches);

    if (!spaceRef.current) return;

    const {
      positionX,
      positionY,
      scale,
    } = spaceRef.current.state;


    const current = event.touches.item(0);
    const x = (current.clientX - (menuMode === MenuMode.NONE ? APP_BAR_X : menuX) - positionX) / scale;
    const y = (current.clientY - TAB_HEIGHT - positionY) / scale;

    publishAvatar(props.abstractId, x, y); 
  }
 
  const handleTouchMove = (event: React.TouchEvent) => {
    event.stopPropagation();
    setTouches(event.touches);

    if (!touches) return;
    
    const current = event.touches.item(0);
    const dx = Math.round(current.clientX - touches.item(0).clientX);
    const dy = Math.round(current.clientY - touches.item(0).clientY);

    if (drag?.twigId) {
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
            ...drag,
            targetTwigId,
          }));
        }
        else {
          dispatch(setDrag({
            ...drag,
            targetTwigId: '',
          }));
        }
      }

      dispatch(moveTwigs({
        abstractId: props.abstractId,
        twigIds: [
          drag?.twigId,
          ...Object.keys(idToDescIdToTrue[drag?.twigId] || {}),
        ],
        dx,
        dy,
      }));
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    endDrag();
  }


  const postTwigMarkers: JSX.Element[] = [];
  const linkTwigMarkers: JSX.Element[] = [];
  const twigs: JSX.Element[] = [];

  const dropTargets: JSX.Element[] = [];

  const idToPos1: IdToType<PosType> = {};


  Object.keys(idToTwig || {}).forEach(twigId => {
    const twig = idToTwig[twigId];
    const pos = (idToPos ?? {})[twigId];

    if (!twig || twig.deleteDate || !pos) return;
    if (twig.abstractId !== abstract?.id) return;

    const parentTwig = idToTwig[twig.parent?.id];

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

      linkTwigMarkers.push(
        <LinkTwigMarker
          key={`link-twig-marker-${twigId}`}
          twig={twig}
          sourcePos={sourcePos}
          targetPos={targetPos}
        />
      );

      twigs.push(
        <div key={`twig-${twigId}`} 
          id={'twig-' + twig.id}
          style={{
            position: 'absolute',
            left: x + VIEW_RADIUS,
            top: y + VIEW_RADIUS,
            zIndex: twig.z,
            pointerEvents: 'none',
            marginLeft: -80,
            marginTop: -80,
            padding: 80,
          }}
        >
          <LinkTwig 
            twigId={twig.id} 
            setIsSynced={setIsSynced}
          />
        </div>
      );
    }
    else {
      if (parentTwig && !parentTwig.deleteDate) {
        const parentPos = idToPos[twig.parent.id];
        if (parentPos) {
          postTwigMarkers.push(
            <PostTwigMarker
              key={`post-twig-marker-${twigId}`}
              twig={twig}
              pos={pos}
              parentPos={parentPos}
            />
          );
        }
      }

      twigs.push(
        <div key={`twig-${twigId}`} 
          id={'twig-' + twig.id}
          style={{
            position: 'absolute',
            left: pos.x + VIEW_RADIUS,
            top: pos.y + VIEW_RADIUS,
            zIndex: twig.z,
            pointerEvents: 'none',
            marginLeft: -80,
            marginTop: -80,
            padding: 80,
          }}
        >
          <PostTwig twigId={twig.id} />
        </div>
      );
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
              : 0,
            borderRadius: 10,
            border: `2px solid ${twig.user.color}`,
          }}
        />
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%',
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
        <TransformWrapper
          ref={spaceRef}
          initialScale={1}
          minScale={.03125}
          maxScale={4}
          initialPositionX={VIEW_RADIUS}
          initialPositionY={VIEW_RADIUS}
          centerZoomedOut={false}
          panning={{
            disabled: !!drag?.twigId,
          }}
          wheel={{
            step: SCROLL_SENSITIVITY,
          }}
        >
          {({ state, zoomIn, zoomOut, resetTransform, setTransform, ...rest}) => (
            <React.Fragment>
              <TransformComponent
                wrapperStyle={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                }}
                contentStyle={{
                  width: 2 * VIEW_RADIUS,
                  height: 2 * VIEW_RADIUS,
                  backgroundColor: palette === 'dark'
                    ? '#000000'
                    : OFF_WHITE,
                  borderRadius: 200,
                  outline: '10px solid',
                }}
              >
                <svg viewBox={`0 0 ${VIEW_RADIUS * 2} ${VIEW_RADIUS * 2}`} style={{
                  width: VIEW_RADIUS * 2,
                  height: VIEW_RADIUS * 2,
                }}>
                  { postTwigMarkers }
                  { linkTwigMarkers }
                </svg>
                { twigs }
                { dropTargets }
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
        {
          Object.keys(idToAvatar || {}).map(id => {
            const avatar = idToAvatar[id];

            if (!spaceRef.current) return null;

            const {
              positionX,
              positionY,
              scale,
            } = spaceRef.current.state;

            return (
              <div key={`cursor-${id}`} style={{
                position: 'absolute',
                left: avatar.x * scale + positionX,
                top: avatar.y * scale + positionY,
                zIndex: MAX_Z_INDEX + 100,
                color: avatar.color,
                display: 'flex',
                fontSize: 20,
                pointerEvents: 'none',
              }}>
                <IonIcon icon={navigateCircleOutline} size='large'/>
                {avatar.name}
              </div>
            )
          })
        }
      </IonCard>
      <SpaceControls 
        showRoles={showRoles}
        setShowRoles={setShowRoles}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
        isSynced={isSynced}
        setIsSynced={setIsSynced}
      />
      <SpaceNav />
      <SettingsModal 
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />
      <RemoveTwigModal />
      <ReplyTwigModal />
    </SpaceContext.Provider>
  );
};

export default memo(SpaceComponent);

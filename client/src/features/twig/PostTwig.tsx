import React, { useContext, useEffect, useRef } from 'react';
import TwigBar from './TwigBar';
import TwigControls from './TwigControls';
import useSelectTwig from './useSelectTwig';
import { SpaceContext } from '../space/SpaceComponent';
import { TWIG_WIDTH } from '../../constants';
import useLinkArrows from '../arrow/useLinkArrows';
import ArrowComponent from '../arrow/ArrowComponent';
import { selectSelectedTwigId, setSelectedSpace, mergeIdToHeight, selectHeightByTwigId } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import { selectTwigById } from './twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { IonCard, IonGrid, IonPopover } from '@ionic/react';

interface PostTwigProps {
  twigId: string;
}
function PostTwig(props: PostTwigProps) {
  const dispatch = useAppDispatch();

  const {
    pendingLink,
    setPendingLink,
  } = useContext(AppContext);

  const {
    space,
    abstract,
    canEdit,
  } = useContext(SpaceContext);

  const twig = useAppSelector(state => selectTwigById(state, space, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const height = useAppSelector(state => selectHeightByTwigId(state, space, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLElement>();

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        space,
        idToHeight: {
          [props.twigId]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { selectTwig } = useSelectTwig(space, canEdit);
  const { linkArrows } = useLinkArrows();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (pendingLink.sourceArrowId === twig.detailId) {
      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: '',
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
    if (pendingLink.sourceArrowId && pendingLink.targetArrowId === twig.detailId) {
      linkArrows(pendingLink);
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {

  }
  
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(setSelectedSpace(space));
    if (!isSelected) {
      selectTwig(abstract, twig);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceArrowId && pendingLink.sourceArrowId !== twig.detailId) {
      setPendingLink({
        ...pendingLink,
        targetAbstractId: twig.abstractId,
        targetArrowId: twig.detailId,
        targetTwigId: twig.id,
      });
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (pendingLink.sourceArrowId && pendingLink.sourceArrowId !== twig.detailId) {
      setPendingLink({
        ...pendingLink,
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
  }

  const isLinking = (
    pendingLink.sourceArrowId === twig.detailId || 
    pendingLink.targetArrowId === twig.detailId
  );

  return (
    <div>
      <IonCard
        id={'twig-' + twig.id}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: TWIG_WIDTH,
          opacity: .9,
          outline: isSelected
            ? `10px solid ${twigUser?.color}`
            : `1px solid ${twigUser?.color}`,
          borderRadius: 15,
          borderTopLeftRadius: 0,
          backgroundColor: isLinking
            ? twigUser?.color
            : null,
          cursor: pendingLink.sourceArrowId
            ? 'crosshair'
            : 'default', 
          pointerEvents: 'auto',
        }}
      >
        <TwigBar
          twig={twig}
          twigUser={twigUser}
          isSelected={isSelected}
        />
        <div style={{
          padding: 0.5,
          paddingLeft: 4,
          paddingTop: 10,
        }}>
          <ArrowComponent
            arrowId={twig.detailId}
            instanceId={twig.id}
            showLinkLeftIcon={false}
            showLinkRightIcon={false}
            showPostIcon={false}
            isTab={!!twig.tabId}
            isGroup={!twig.tabId && !!twig.groupId}
            isWindow={!twig.tabId && !twig.groupId && !!twig.windowId}
            fontSize={twig.isOpen ? 80 : 20}
          />
          <TwigControls
            twig={twig}
            isPost={true}
          />
        </div>
      </IonCard>
    </div>
  );
}

export default React.memo(PostTwig);
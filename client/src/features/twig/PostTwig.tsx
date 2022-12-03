import React, { useContext, useEffect, useRef } from 'react';
import TwigBar from './TwigBar';
import TwigControls from './TwigControls';
import useSelectTwig from './useSelectTwig';
import { SpaceContext } from '../space/SpaceComponent';
import { TWIG_WIDTH } from '../../constants';
import useLinkArrows from '../arrow/useLinkArrows';
import ArrowComponent from '../arrow/ArrowComponent';
import { selectSelectedTwigId, mergeIdToHeight, selectHeightByTwigId, selectScale, selectTwigById } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { IonCard, IonGrid, IonPopover, isPlatform } from '@ionic/react';

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
    abstractId,
    abstract,
    canEdit,
  } = useContext(SpaceContext);

  const scale = useAppSelector(selectScale(abstractId));
  
  const twig = useAppSelector(state => selectTwigById(state, abstractId, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const height = useAppSelector(state => selectHeightByTwigId(state, abstractId, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLIonCardElement>(null);

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        abstractId,
        idToHeight: {
          [props.twigId]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { selectTwig } = useSelectTwig();
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
    if (!isSelected) {
      selectTwig(abstract, twig, canEdit);
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
    <IonCard
      ref={cardEl}
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
        margin: 0,
        outline: isSelected
          ? `5px solid ${twigUser?.color}`
          : null,
        border: `1px solid ${twigUser?.color}`,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        backgroundColor: isLinking
          ? twigUser?.color
          : null,
        cursor: pendingLink.sourceArrowId
          ? 'crosshair'
          : 'default', 
        pointerEvents: 'auto',
        fontSize: 10,
      }}
    >
      <TwigBar
        twig={twig}
        twigUser={twigUser}
        isSelected={isSelected}
      />
      <div style={{
        padding: 5,
      }}>
        <ArrowComponent
          arrowId={twig.detailId}
          instanceId={twig.id}
          showLinkLeftIcon={false}
          showLinkRightIcon={false}
          showPostIcon={false}
          fontSize={twig.isOpen ? 30 : 10}
          tagFontSize={10}
        />
        <TwigControls
          twig={twig}
          isPost={true}
        />
      </div>
    </IonCard>
  );
}

export default React.memo(PostTwig);
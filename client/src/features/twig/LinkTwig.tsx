import React, { Dispatch, SetStateAction, useContext, useEffect, useRef } from 'react';
import { SpaceContext } from '../space/SpaceComponent';
import { CLOSED_LINK_TWIG_DIAMETER, TWIG_WIDTH } from '../../constants';
import { mergeIdToHeight, mergeTwigs, selectHeightByTwigId, selectSelectedTwigId, selectTwigById } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import useOpenTwig from './useOpenTwig';
import useSelectTwig from './useSelectTwig';
import useLinkArrows from '../arrow/useLinkArrows';
import { IonButton, IonButtons, IonCard, IonIcon } from '@ionic/react';
import { close, remove } from 'ionicons/icons';
import ArrowComponent from '../arrow/ArrowComponent';
import TwigControls from './TwigControls';
import { Twig } from './twig';

interface LinkTwigProps {
  twigId: string;
  setIsSynced: Dispatch<SetStateAction<boolean>>;
}
 
function LinkTwig(props: LinkTwigProps) {
  const dispatch = useAppDispatch();

  const { 
    user,
    pendingLink, 
    setPendingLink,
  } = useContext(AppContext);

  const { 
    abstract,
    abstractId, 
    canEdit,
    setRemovalTwigId,
    setShowRemoveTwigModal,
  } = useContext(SpaceContext);
  
  const twig = useAppSelector(state => selectTwigById(state, abstractId, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const isLinking = (
    pendingLink.sourceArrowId === twig.detailId || 
    pendingLink.targetArrowId === twig.detailId
  );

  const height = useAppSelector(state => selectHeightByTwigId(state, abstractId, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLIonCardElement>(null);

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        abstractId,
        idToHeight: {
          [twig.id]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { openTwig } = useOpenTwig();
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
      })
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

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectTwig(abstract, twig, canEdit);
    if (twig.userId === user?.id || canEdit) {
      openTwig(twig, !twig.isOpen);
    }
    else {
      dispatch(mergeTwigs({
        abstractId,
        twigs: [{
          id: twig.id,
          isOpen: !twig.isOpen,
        } as Twig],
      }))
      props.setIsSynced(false);
    }
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovalTwigId(twig.id);
    setShowRemoveTwigModal(true);
  }

  if (twig.isOpen) {
    return (
      <IonCard
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
            ? `5px solid ${twigUser?.color}`
            : null,
          border: `1px solid ${twigUser?.color}`,
          borderRadius: 15,
          borderTopLeftRadius: 0,
          backgroundColor: isLinking
            ? twigUser?.color
            : null,
          cursor: pendingLink.sourceArrowId
            ? 'crosshair'
            : 'default', 
          pointerEvents: 'auto',
          margin: 0,
        }}
      >
        <div style={{
          padding: 5,
          paddingTop: 6,
          position: 'relative',
        }}>
          <IonButtons style={{
            position: 'absolute',
            right: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'row',
          }}>
            <IonButton style={{
              height: 16,
              fontSize: 6,
            }}>
              { twig.i }
            </IonButton>
            <IonButton onClick={handleOpenClick} style={{
              height: 16,
            }}>
              <IonIcon icon={remove}style={{
                fontSize: 10,
              }}/>
            </IonButton>
            <IonButton  onClick={handleRemoveClick} style={{
              height: 16,
            }}>
              <IonIcon icon={close}style={{
                fontSize: 10,
              }}/>
            </IonButton>
          </IonButtons>
          <ArrowComponent
            arrowId={twig.detailId}
            instanceId={twig.id}
            showLinkLeftIcon={false}
            showLinkRightIcon={false}
            showPostIcon={false}
            fontSize={10}
            tagFontSize={10}
          />
          <TwigControls
            twig={twig}
            isPost={false}
          />
        </div>
      </IonCard>
    );
  }

  return (
    <div>
      <IonCard ref={cardEl} onClick={handleOpenClick} style={{
        width: CLOSED_LINK_TWIG_DIAMETER,
        height: CLOSED_LINK_TWIG_DIAMETER,
        border: `1px solid ${twigUser?.color}`,
        outline: isSelected
          ? `5px solid ${twigUser?.color}`
          : null,
        borderRadius: 10,
        borderTopLeftRadius: 0,
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        opacity: .6,
        margin: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: 12,
        }}>
          { 
            twig.detail.weight > 1000
              ? `${(twig.detail.weight / 1000).toFixed(1)}k`
              : twig.detail.weight
          }
        </div>
      </IonCard>
    </div>
  );
}

export default React.memo(LinkTwig)
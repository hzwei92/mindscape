import React, { useContext, useEffect, useRef } from 'react';
import { SpaceContext } from '../space/SpaceComponent';
import { CLOSED_LINK_TWIG_DIAMETER, TWIG_WIDTH } from '../../constants';
import { mergeIdToHeight, selectHeightByTwigId, selectSelectedTwigId } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import { selectTwigById } from './twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import useOpenTwig from './useOpenTwig';
import useSelectTwig from './useSelectTwig';
import useLinkArrows from '../arrow/useLinkArrows';
import { IonButton, IonButtons, IonCard, IonIcon } from '@ionic/react';
import { close, remove } from 'ionicons/icons';
import ArrowComponent from '../arrow/ArrowComponent';
import TwigControls from './TwigControls';

interface LinkTwigProps {
  twigId: string;
}
 
function LinkTwig(props: LinkTwigProps) {
  const dispatch = useAppDispatch();

  const { 
    palette,
    pendingLink, 
    setPendingLink,
  } = useContext(AppContext);

  const { 
    abstract,
    space, 
    canEdit,
    setRemovalTwigId,
  } = useContext(SpaceContext);
  
  const twig = useAppSelector(state => selectTwigById(state, space, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const isLinking = (
    pendingLink.sourceArrowId === twig.detailId || 
    pendingLink.targetArrowId === twig.detailId
  );

  const height = useAppSelector(state => selectHeightByTwigId(state, space, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLIonCardElement>(null);

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        space,
        idToHeight: {
          [twig.id]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { openTwig } = useOpenTwig();
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
    if (!isSelected) {
      selectTwig(abstract, twig);
    }
    openTwig(twig, !twig.isOpen);
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovalTwigId(twig.id);
  }

  return (
    <div>
      <IonCard ref={cardEl} onClick={handleOpenClick} style={{
        width: CLOSED_LINK_TWIG_DIAMETER,
        height: CLOSED_LINK_TWIG_DIAMETER,
        outline: isSelected
          ? `5px solid ${twigUser?.color}`
          : `1px solid ${twigUser?.color}`,
        borderRadius: 15,
        borderTopLeftRadius: 0,
        display: twig.isOpen
          ? 'none'
          : 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        opacity: .9,
        margin: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
            {twig.detail.weight}
        </div>
      </IonCard>
      <div style={{
        display: twig.isOpen
          ? 'flex'
          : 'none',
      }}>
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
            opacity: .8,
            outline: isSelected
              ? `10px solid ${twigUser?.color}`
              : `1px solid ${twigUser?.color}`,
            borderRadius: 20,
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
            display: 'flex',
          }}>
            <div style={{
              padding: 0.5,
              paddingLeft: 0,
            }}>
              <div style={{
                marginRight: 0.5,
                paddingLeft: 4,
                position: 'relative',
              }}>
                <IonButtons style={{
                  position: 'absolute',
                  left: TWIG_WIDTH - 85,
                  top: 0,
                  zIndex: 1,
                  display: 'flex',
                }}>
                  <IonButton onClick={handleOpenClick}>
                    <IonIcon icon={remove} />
                  </IonButton>
                  <IonButton onClick={handleRemoveClick}>
                    <IonIcon icon={close} />
                  </IonButton>
                </IonButtons>
                <ArrowComponent
                  arrowId={twig.detailId}
                  instanceId={twig.id}
                  showLinkLeftIcon={false}
                  showLinkRightIcon={false}
                  showPostIcon={false}
                  isTab={!!twig.tabId}
                  isGroup={!twig.tabId && !!twig.groupId}
                  isWindow={!twig.tabId && !twig.groupId && !!twig.windowId}
                  fontSize={20}
                />
                <TwigControls
                  twig={twig}
                  isPost={false}
                />
              </div>
            </div>
          </div>
        </IonCard>
      </div>
    </div>
  );
}

export default React.memo(LinkTwig)
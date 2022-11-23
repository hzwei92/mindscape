import React, { useContext, useState } from 'react';
import type { Twig } from './twig';
import UserTag from '../user/UserTag';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectArrowById } from '../arrow/arrowSlice';
import { selectSheafById } from '../sheaf/sheafSlice';
import { v4 } from 'uuid';
import { AppContext } from '../../app/App';
import useReplyTwig from './useReplyTwig';
import { addEntry } from '../entry/entrySlice';
import { searchPushSlice } from '../search/searchSlice';
import { IonButton, IonButtons, IonIcon, IonItem, IonMenu, IonPopover, useIonRouter, useIonToast } from '@ionic/react';
import { create, ellipsisVertical, link, shieldCheckmarkOutline, closeOutline, notificationsCircleOutline, notificationsOutline} from 'ionicons/icons';
import usePasteTwig from './usePasteTwig';
import { RoleType } from '../role/role';
import useRequestRole from '../role/useRequestRole';
import { selectRoleByUserIdAndArrowId } from '../role/roleSlice';
import { MenuMode } from '../menu/menu';
//import useCenterTwig from './useCenterTwig';

interface TwigControlsProps {
  twig: Twig;
  isPost: boolean;
}

function TwigControls(props: TwigControlsProps) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const [present] = useIonToast();

  const {
    user,
    pendingLink,
    setPendingLink,
    setIsCreatingGraph,
    setCreateGraphArrowId,
    clipboardArrowIds,
    setClipboardArrowIds,
    setMenuMode,
  } = useContext(AppContext);
  
  const {
    abstract,
    canPost,
    canView
  } = useContext(SpaceContext)

  const arrow = useAppSelector(state => selectArrowById(state, props.twig.detailId));
  const sheaf = useAppSelector(state => selectSheafById(state, arrow?.sheafId));
  const role = useAppSelector(state => selectRoleByUserIdAndArrowId(state, user?.id, arrow?.id));

  const showOpen = !!arrow?.rootTwigId || user?.id === arrow?.userId;

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyTwig } = useReplyTwig();
  const { pasteTwig } = usePasteTwig();
  const { requestRole } = useRequestRole();

  const isSubbed = (
    user?.id && arrow?.userId === user?.id || 
    !!role && role.type !== RoleType.OTHER
  );

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(arrow);
    if (!arrow) return;
    
    if (arrow.rootTwigId) {
      const route = `/g/${arrow.routeName}/0`;
      router.push(route);
    }
    else {
      setCreateGraphArrowId(arrow.id);
      setIsCreatingGraph(true);
    }
  }

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!arrow) return;
    replyTwig(props.twig, arrow);
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (pendingLink.sourceArrowId === props.twig.detailId) {
      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: '',
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
    else {
      setPendingLink({
        sourceAbstractId: props.twig.abstractId,
        sourceArrowId: props.twig.detailId,
        sourceTwigId: props.twig.id,
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
  }

  const handleRouteClick = (event: React.MouseEvent) => {
    setIsEditingRoute(!isEditingRoute);
  }

  const handleCopyClick = () => {
    setClipboardArrowIds([
      props.twig.detailId,
    ]);
    present({
      message: 'Arrow copied to clipboard',
      duration: 2000,
    })
  }

  const handlePasteClick = () => {
    if (!arrow) return;

    pasteTwig(props.twig, arrow);
  }
  const handleCopyURLClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://mindscape.pub/g/${arrow?.routeName}`);
  }

  const handleCopyRelativeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://mindscape.pub/g/${abstract?.routeName}/${props.twig.i}`);
  }

  const handleSubscribeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (arrow) {
      requestRole(arrow?.id, RoleType.SUBSCRIBER);
    }
  }
  
  const handleUnsubscribeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (arrow && role?.type === RoleType.SUBSCRIBER) {
      requestRole(arrow?.id, RoleType.OTHER);
    }
  }

  const handleCommitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setCommitArrowId(props.twig.detailId))
  }

  const handleRemoveClick =  (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setRemoveArrowId(props.twig.detailId));
  }

  const handlePrevClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    console.log('prev', arrow);
    if (!arrow) return;

    const id = v4();
    
    dispatch(addEntry({
      id,
      userId: arrow.userId,
      parentId: '',
      arrowId: arrow.id,
      showIns: true,
      showOuts: false,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: true,
    }));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds: [id],
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH)
  }

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    console.log('next', arrow);
    if (!arrow) return;

    const id = v4();

    let sourceId = null;
    let targetId = null;
    if (arrow.sourceId !== arrow.targetId) {
      if (arrow.source) {
        sourceId = v4();

        dispatch(addEntry({
          id: sourceId,
          userId: arrow.source.userId,
          parentId: id,
          arrowId: arrow.source.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
        }));
      }

      if (arrow.target) {
        targetId = v4();
        dispatch(addEntry({
          id: targetId,
          userId: arrow.target.userId,
          parentId: id,
          arrowId: arrow.target.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
        }));
      }
    }

    dispatch(addEntry({
      id,
      userId: arrow.userId,
      parentId: '',
      arrowId: arrow.id,
      showIns: false,
      showOuts: true,
      inIds: [],
      outIds: [],
      sourceId,
      targetId,
      shouldGetLinks: true,
    }));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds: [id],
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH)
  }

  return (
    <IonButtons style={{
      marginLeft: 5,
      marginTop: 5,
      marginBottom: -5,
      display: 'flex',
      flexDirection: 'row',
    }}>
      <IonButton
        disabled={!canPost}
        onMouseDown={handleMouseDown} 
        onClick={handleReplyClick}
        style={{
          fontSize: 5,
          height: 20,
        }}
      >
        REPLY
      </IonButton>
      <IonButton 
        disabled={!canView} 
        onMouseDown={handleMouseDown} 
        onClick={handleLinkClick}
        style={{
          fontSize: 5,
          height: 20,
        }}
      >
        LINK
      </IonButton>
      <IonButton 
        id={'twigOptionsButton-' + props.twig.id} 
        size='small'
        onMouseDown={handleMouseDown} 
        style={{
          color: isSubbed ? user?.color : null,
          height: 20,
        }}
      >
        <IonIcon icon={ellipsisVertical} style={{
          fontSize: 5,
        }}/>
      </IonButton>
      <IonPopover trigger={'twigOptionsButton-' + props.twig.id} triggerAction='click'>
        <div style={{
          margin: 10,
          borderBottom: '1px solid',
          paddingTop: 5,
          paddingBottom: 10,
        }}>
          <IonButtons>
            {
              isSubbed
                ? <IonButton 
                    disabled={
                      arrow?.userId === user?.id || 
                      role?.type === RoleType.ADMIN || 
                      role?.type === RoleType.MEMBER
                    } 
                    onClick={handleUnsubscribeClick}
                  >
                    UNSUBSCRIBE
                  </IonButton>
                : <IonButton onClick={handleSubscribeClick}>
                    SUBSCRIBE
                  </IonButton>
            }
          </IonButtons>
          <IonButtons>
            <IonButton onClick={handleCopyClick}>
              COPY
            </IonButton>
            <IonButton disabled={clipboardArrowIds.length !== 1} onClick={handlePasteClick}>
              PASTE
            </IonButton>
          </IonButtons>
        </div>
        <div style={{
          display: 'table',
          borderSpacing: 10,
        }}>
          <div style={{
            display: 'table-row',
            flexDirection: 'row',
          }}>
            <div style={{
              display: 'table-cell',
              fontWeight: 'bold',
            }}>
              arrowID
            </div>
            <div style={{
              display: 'table-cell',
            }}>
              {props.twig.detailId}
            </div>
          </div>
          <div style={{
            display: 'table-row',
          }}>
            <div style={{
              display: 'table-cell',
              fontWeight: 'bold',
            }}>
              arrowUser
            </div>
            <div style={{
              display: 'table-cell',
              color: arrow?.user.color
            }}>
              {arrow?.user.name}
            </div>
          </div>
          <div style={{
            display: 'table-row',
          }}>
            <div style={{
              display: 'table-cell',
              fontWeight: 'bold',
            }}>
              twigID
            </div>
            <div style={{
              display: 'table-cell',
            }}>
              {props.twig.id}
            </div>
          </div>
          <div style={{
            display: 'table-row',
          }}>
            <div style={{
              display: 'table-cell',
              fontWeight: 'bold',
            }}>
              twigUser
            </div>
            <div style={{
              display: 'table-cell',
              color: props.twig.user.color,
            }}>
              {props.twig.user.name}
            </div>
          </div>
          <div style={{
            display: 'table-row'
          }}>
            <div style={{
              display: 'table-cell',
              fontWeight: 'bold',
            }}>
              routeName
            </div>
            <div style={{
              display: 'table-cell',
              whiteSpace: 'pre-wrap',
            }}>
              /g/{abstract?.routeName}/{props.twig.i}
            </div>
          </div>
        </div>
      </IonPopover>
      <IonButton 
        onMouseDown={handleMouseDown} 
        onClick={handlePrevClick}
        style={{
          fontSize: 5,
          height: 20,
        }}
      >
        {arrow?.inCount} IN
      </IonButton>
      <IonButton 
        onMouseDown={handleMouseDown} 
        onClick={handleNextClick}
        style={{
          fontSize: 5,
          height: 20,
        }}
      >
        {arrow?.outCount} OUT
      </IonButton>
      <div style={{
        display: showOpen 
          ? 'block'
          : 'none',
      }}>
        <IonButton
          onMouseDown={handleMouseDown}
          onClick={handleOpenClick}
          style={{
            fontSize: 5,
            height: 20,
          }}
        >
          OPEN {arrow?.twigN ? `(${arrow?.twigN})` : ''}
        </IonButton>
      </div>
    </IonButtons>
  )
}

export default React.memo(TwigControls)
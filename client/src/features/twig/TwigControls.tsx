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
  } = useContext(AppContext);
  
  const {
    abstract,
    canPost,
    canView
  } = useContext(SpaceContext)

  const arrow = useAppSelector(state => selectArrowById(state, props.twig.detailId));
  const sheaf = useAppSelector(state => selectSheafById(state, arrow?.sheafId));

  const showOpen = !!arrow?.rootTwigId || user?.id === arrow?.userId;
  const frameTwig = null;
  const focusTwig = null;

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);
  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyTwig } = useReplyTwig();
  const { pasteTwig } = usePasteTwig();

  // const { sub } = useSubArrow(props.twig.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { unsub } = useUnsub(props.twig.post, () => {
  //   props.setIsLoading(false);
  // });

  // const { addTwig: addFrameTwig } = useAddTwig('FRAME');
  // const { addTwig: addFocusTwig } = useAddTwig('FOCUS');

  //const { centerTwig: centerFrameTwig } = useCenterTwig(user, 'FRAME');
  //const { centerTwig: centerFocusTwig } = useCenterTwig(user, 'FOCUS');


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

  const handleMenuOpenClick = (event: React.MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setIsEditingRoute(false);
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
    handleMenuClose();
  }

  const handleCopyRelativeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://mindscape.pub/g/${abstract?.routeName}/${props.twig.i}`);
    handleMenuClose();
  }

  const handleSubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //sub();
    handleMenuClose();
  }
  
  const handleUnsubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //unsub();
    handleMenuClose();
  }

  const handleCommitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setCommitArrowId(props.twig.detailId))
    handleMenuClose();
  }

  const handleRemoveClick =  (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setRemoveArrowId(props.twig.detailId));
    handleMenuClose();
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
  }

  return (
    <IonButtons style={{
      margin: 1,
      marginTop: 0,
      marginLeft: 25,
      display: 'flex',
      flexDirection: 'row',
    }}>
      <IonButton
        disabled={!canPost}
        onMouseDown={handleMouseDown} 
        onClick={handleReplyClick}
      >
        REPLY
      </IonButton>
      <IonButton disabled={!canView} onMouseDown={handleMouseDown} onClick={handleLinkClick}>
        LINK
      </IonButton>
      <IonButton id={'twigOptionsButton-' + props.twig.id} onMouseDown={handleMouseDown} onClick={handleMenuOpenClick}>
        <IonIcon icon={ellipsisVertical} size='small' />
      </IonButton>
      <IonPopover trigger={'twigOptionsButton-' + props.twig.id} triggerAction='click'>
        <div style={{
          padding: 10,
          display: 'table',
          borderSpacing: 5,
        }}>
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
        </div>
        <IonButtons style={{
          padding: 10,
        }}>
          <IonButton onClick={handleCopyClick}>
            COPY
          </IonButton>
          {
            clipboardArrowIds.length === 1
              ? <IonButton onClick={handlePasteClick}>
                  PASTE
                </IonButton>
              : null
          }
          
        </IonButtons>
      </IonPopover>
      <IonMenu>
        {
          props.twig.user.id !== arrow?.user.id
            ? <div style={{
                fontSize: 12,
                padding: 1,
              }}>
                reposted by&nbsp;
                <UserTag user={props.twig.user} />
              </div>
            : null
        }
        {
          arrow?.userId === user?.id
            ? <IonItem onClick={handleRouteClick} style={{
                fontSize: 14,
              }}>
                <div style={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <IonIcon icon={create} />
                </div>
                &nbsp; Edit hyperlink
              </IonItem>
            : null
        }
        <IonItem onClick={handleCopyClick} style={{
          fontSize: 14,
        }}>
          <div style={{
            marginLeft: '-5px',
            marginBottom: '-5px',
            fontSize: 14,
          }}>
            <IonIcon icon={link}/>
          </div>
          &nbsp; Copy hyperlink
        </IonItem>
        <IonItem onClick={handleCopyRelativeClick} style={{
          fontSize: 14,
        }}>
          <div style={{
            marginLeft: '-5px',
            marginBottom: '-5px',
            fontSize: 14,
          }}>
            <IonIcon icon={link} />
          </div>
          &nbsp; Copy hyperlink (with context)
        </IonItem>
        {
          arrow?.userId === user?.id && !arrow?.commitDate && !arrow?.removeDate
            ? <IonItem onClick={handleCommitClick} style={{
                fontSize: 14,
              }}>
                <div style={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <IonIcon icon={shieldCheckmarkOutline} />
                </div>
                &nbsp; Commit post
              </IonItem>
            : null
        }
        {
          arrow?.userId === user?.id && !arrow?.removeDate
            ? <IonItem onClick={handleRemoveClick} style={{
                fontSize: 14,
              }}>
                <div style={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <IonIcon icon={closeOutline} />
                </div>
                &nbsp; Delete post
              </IonItem>
            : null
        }
        {
          false
            ? <IonItem onClick={handleUnsubClick} style={{
                fontSize: 14,
              }}>
                <div style={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                  color: user?.color, 
                }}>
                  <IonIcon icon={notificationsCircleOutline} />
                </div>
                &nbsp; Unsubscribe from post
              </IonItem>
            : <IonItem onClick={handleSubClick} style={{
                fontSize: 14,
              }}>
                <div style={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <IonIcon icon={notificationsOutline} />
                </div>
                &nbsp; Subscribe to post
              </IonItem>
          }
      </IonMenu>
      <IonButton routerLink='/search' onMouseDown={handleMouseDown} onClick={handlePrevClick}>
        {arrow?.inCount} IN
      </IonButton>
      <IonButton routerLink='/search' onMouseDown={handleMouseDown} onClick={handleNextClick}>
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
        >
          OPEN {arrow?.twigN ? `(${arrow?.twigN})` : ''}
        </IonButton>
      </div>
    </IonButtons>
  )
}

export default React.memo(TwigControls)
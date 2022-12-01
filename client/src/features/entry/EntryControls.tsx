
import React, { Dispatch, SetStateAction, useContext, useRef, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import { Arrow } from '../arrow/arrow';
import useReplyEntry from './useReplyEntry';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonIcon, IonPopover, isPlatform, useIonRouter } from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';
import { selectUserById } from '../user/userSlice';
import usePasteEntry from './usePasteEntry';
import { selectRoleByUserIdAndArrowId } from '../role/roleSlice';
import { RoleType } from '../role/role';
import useRequestRole from '../role/useRequestRole';
import usePromoteEntry from './usePromotEntry';
import { MenuMode } from '../menu/menu';

interface EntryControlsProps {
  entry: Entry;
  arrow: Arrow;
  depth: number;
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function EntryControls(props: EntryControlsProps) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const {
    user,
    pendingLink,
    setPendingLink,
    clipboardArrowIds,
    setClipboardArrowIds,
    setCreateGraphArrowId,
    setIsCreatingGraph,
    setMenuMode,
  } = useContext(AppContext);

  const arrowUser = useAppSelector(state => selectUserById(state, props.arrow.userId));
  const role = useAppSelector(state => selectRoleByUserIdAndArrowId(state, user?.id, props.arrow.id));

  const isSubbed = (
    !!user && arrowUser?.id === user.id || 
    !!role && role.type !== RoleType.OTHER
  );

  const showOpen = !!props.arrow.rootTwigId || props.arrow.userId === user?.id;

  const [showMenu, setShowMenu] = useState(false);

  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyEntry } = useReplyEntry();
  const { pasteEntry } = usePasteEntry(props.entry.id);
  const { requestRole } = useRequestRole();

  const { promoteEntry } = usePromoteEntry();

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.arrow.rootTwigId) {
      const route = `/g/${props.arrow.routeName}/0`;
      router.push(route);
      if (isPlatform('mobile')) {
        setMenuMode(MenuMode.NONE);
      }
    }
    else {
      setCreateGraphArrowId(props.arrow.id);
      setIsCreatingGraph(true);
    }
  }

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    replyEntry(props.entry);
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingLink.sourceArrowId === props.entry.arrowId) {
      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: '',
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      })
    }
    else {
      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: props.entry.arrowId,
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });
    }
  }

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.entry.showIns) {
      dispatch(updateEntry({
        ...props.entry,
        showIns: false,
      }));
    }
    else {
      dispatch(updateEntry({
        ...props.entry,
        showIns: true,
        showOuts: false,
        shouldGetLinks: true,
      }));
    }
  }

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.entry.showOuts) {
      dispatch(updateEntry({
        ...props.entry,
        showOuts: false,
      }));
    }
    else {
      dispatch(updateEntry({
        ...props.entry,
        showIns: false,
        showOuts: true,
        shouldGetLinks: true,
      }));
    }
  }

  const handlePromoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    popoverRef.current?.dismiss();
    setShowMenu(false);
    promoteEntry(props.entry);
  }

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false);
    setClipboardArrowIds([props.arrow.id]);

  }

  const handlePasteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    pasteEntry();
  }

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    requestRole(props.arrow.id, RoleType.SUBSCRIBER);
  }
  
  const handleUnsubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (role?.type === RoleType.SUBSCRIBER) {
      requestRole(props.arrow.id, RoleType.OTHER);
    }
  }

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(true);
  }

  return (
    <IonButtons style={{
      marginLeft: 8,
      marginBottom: -8,
    }}>
      <IonButton onClick={handleReplyClick} style={{
        fontSize: 10,
        height: 20,
      }}>
        REPLY
      </IonButton>
      <IonButton onClick={handleLinkClick} style={{
        fontSize: 10,
        height: 20,
      }}>
        LINK
      </IonButton>
      <IonButton id={'entryOptionsButton-' + props.entry.id} onClick={handleOptionsClick} style={{
        color: isSubbed
          ? user?.color
          : null,
        height: 20,
      }}>
        <IonIcon icon={ellipsisVertical} style={{
          fontSize: 10,
        }}/>
      </IonButton>
      <IonPopover 
        trigger={'entryOptionsButton-' + props.entry.id} 
        isOpen={showMenu} 
        ref={popoverRef}
        onWillDismiss={() => {setShowMenu(false)}}
      >
        <div style={{
          margin: 10,
          borderBottom: '1px solid',
          paddingTop: 5,
          paddingBottom: 10,
        }}>
          <IonButtons>
            <IonButton disabled={props.depth === 0} onClick={handlePromoteClick}>
              MOVE TO TOP
            </IonButton>
          </IonButtons>
          <IonButtons>
            {
              isSubbed
                ? <IonButton 
                    disabled={
                      props.arrow.userId === user?.id || 
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
          padding: 10,
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
              {props.arrow.id}
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
              color: arrowUser?.color
            }}>
              {arrowUser?.name}
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
              /g/{props.arrow.routeName}
            </div>
          </div>
        </div>
      </IonPopover>
      &nbsp;&nbsp;
      <span style={{
        whiteSpace: 'nowrap',
      }}>
        <IonButton onClick={handlePrevClick} style={{
          border: props.entry.showIns
            ? `1px solid ${arrowUser?.color}`
            : null,
          borderRadius: 5,
          fontSize: 10,
          height: 20,
        }}>
          {props.arrow.inCount} IN
        </IonButton>
        &nbsp;
        <IonButton onClick={handleNextClick} style={{
          border: props.entry.showOuts
            ? `1px solid ${arrowUser?.color}`
            : null,
          borderRadius: 5,
          fontSize: 10,
          height: 20,
        }}>
          {props.arrow.outCount} OUT
        </IonButton>
        <div style={{
          display: showOpen
            ? 'inline-block'
            : 'none',
        }}>
          <IonButton onClick={handleOpenClick} style={{
            fontSize: 10,
          }}>
            OPEN {props.arrow?.twigN ? `(${props.arrow?.twigN})` : ''}
          </IonButton>
        </div>

      </span>
    </IonButtons>
  )
}
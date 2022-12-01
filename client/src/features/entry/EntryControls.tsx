
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import { Arrow } from '../arrow/arrow';
import useReplyEntry from './useReplyEntry';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonIcon, IonPopover } from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';
import { selectUserById } from '../user/userSlice';
import usePasteEntry from './usePasteEntry';
import { selectRoleByUserIdAndArrowId } from '../role/roleSlice';
import { RoleType } from '../role/role';
import useRequestRole from '../role/useRequestRole';

interface EntryControlsProps {
  entry: Entry;
  arrow: Arrow;
  depth: number;
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function EntryControls(props: EntryControlsProps) {
  const dispatch = useAppDispatch();

  const {
    user,
    pendingLink,
    setPendingLink,
    clipboardArrowIds,
    setClipboardArrowIds,
  } = useContext(AppContext);

  const arrowUser = useAppSelector(state => selectUserById(state, props.arrow.userId));
  const role = useAppSelector(state => selectRoleByUserIdAndArrowId(state, user?.id, props.arrow.id));

  const isSubbed = (
    !!user && arrowUser?.id === user.id || 
    !!role && role.type !== RoleType.OTHER
  );

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyEntry } = useReplyEntry();
  const { pasteEntry } = usePasteEntry(props.entry.id);
  const { requestRole } = useRequestRole();

  // const { promoteEntry } = usePromoteEntry();

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    replyEntry(props.entry);
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handlePrevClick = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleCopyClick = () => {
    setClipboardArrowIds([props.arrow.id]);

  }

  const handlePasteClick = () => {
    pasteEntry();
  }

  const handleSubscribeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    requestRole(props.arrow.id, RoleType.SUBSCRIBER);
  }
  
  const handleUnsubscribeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (role?.type === RoleType.SUBSCRIBER) {
      requestRole(props.arrow.id, RoleType.OTHER);
    }
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
      <IonButton id={'entryOptionsButton-' + props.entry.id} style={{
        color: isSubbed
          ? user?.color
          : null,
        height: 20,
      }}>
        <IonIcon icon={ellipsisVertical} style={{
          fontSize: 10,
        }}/>
      </IonButton>
      <IonPopover trigger={'entryOptionsButton-' + props.entry.id} triggerAction='click'>
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
              color: props.arrow?.user.color
            }}>
              {props.arrow?.user.name}
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
        <IonButton style={{
          fontSize: 10,
        }}>
          OPEN
        </IonButton>
      </span>
    </IonButtons>
  )
}
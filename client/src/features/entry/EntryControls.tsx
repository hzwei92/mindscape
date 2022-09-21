
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

interface EntryControlsProps {
  entry: Entry;
  arrow: Arrow;
  depth: number;
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function EntryControls(props: EntryControlsProps) {
  const dispatch = useAppDispatch();

  const {
    pendingLink,
    setPendingLink,
    clipboardArrowIds,
    setClipboardArrowIds,
  } = useContext(AppContext);

  const arrowUser = useAppSelector(state => selectUserById(state, props.arrow.userId));

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyEntry } = useReplyEntry(props.entry.id);
  const { pasteEntry } = usePasteEntry(props.entry.id);

  // const { promoteEntry } = usePromoteEntry();
  // const { subPost } = useSubPost(props.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { unsubPost } = useUnsubPost(props.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { addTwig: addFrameTwig } = useAddTwig('FRAME');
  // const { addTwig: addFocusTwig } = useAddTwig('FOCUS');

  // const { centerTwig: centerFrameTwig } = useCenterTwig('FRAME');
  // const { centerTwig: centerFocusTwig } = useCenterTwig('FOCUS');

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    replyEntry();
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

  // const handleMenuOpenClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   setMenuAnchorEl(event.currentTarget);
  // }
  // const handleMenuClose = () => {
  //   setIsEditingRoute(false);
  //   setMenuAnchorEl(null)
  // }

  // const handleRouteClick = (event: React.MouseEvent) => {
  //   setIsEditingRoute(!isEditingRoute);
  // }

  // const handleCopyClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   navigator.clipboard.writeText(`https://granum.io/p/${props.post.routeName || props.post.id}`);
  //   enqueueSnackbar('URL copied');
  //   const handleDismissClick = (event: React.MouseEvent) => {
  //     closeSnackbar(props.entry.id);
  //   }
  //   enqueueSnackbar('URL copied', {
  //     key: props.entry.id,
  //     action: () => {
  //       return (
  //         <div>
  //           <IconIonButton onClick={handleDismissClick} style={{
  //             color: getColor(paletteMode, true)
  //           }}>
  //             <CloseIcon style={{
  //               fontSize: 14,
  //             }}/>
  //           </IconIonButton>
  //         </div>
  //       );
  //     }
  //   })
  //   handleMenuClose();
  // }

  // const handleSubClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   subPost();
  //   props.setIsLoading(true);
  //   handleMenuClose();
  // }
  
  // const handleUnsubClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   unsubPost();
  //   props.setIsLoading(true);
  //   handleMenuClose();
  // }


  // const handlePromoteClick = (event: React.MouseEvent) => { 
  //   event.stopPropagation();
  //   promoteEntry(props.entry);
  // }

  // const handleFrameClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (props.frameTwig) {
  //     if (props.frameTwig.postId === framePostId) {
  //       centerFrameTwig(props.frameTwig, true, 0);
  //     }
  //     else {
  //       navigate(`/u/${user?.frame?.routeName}/${props.frameTwig.jamI}`);
  //     }
  //   }
  //   else {
  //     addFrameTwig(props.post.id)
  //   }
  // }

  // const handleFocusClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (props.focusTwig) {
  //     if (props.focusTwig.postId === focusPostId) {
  //       centerFocusTwig(props.focusTwig, true, 0);
  //     }
  //     else {
  //       navigate(`/${user?.focus?.userId ? 'u' : 'j'}/${user?.focus?.routeName}/${props.focusTwig.jamI}`);
  //     }
  //   }
  //   else {
  //     addFocusTwig(props.post.id);
  //   }
  // }

  // const handleCommitClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   commitVar({
  //     postId: props.post.id
  //   });
  //   handleMenuClose();
  // }
  // const handleRemoveClick =  (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   removeVar({
  //     postId: props.post.id
  //   });
  //   handleMenuClose();
  // }

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

  return (
    <IonButtons style={{
      bottom: 0,
      margin: 1,
      marginTop: 0,
      marginLeft: 20,
      fontSize: 12,
    }}>
      <IonButton onClick={handleReplyClick} style={{
        fontSize: 12,
      }}>
        REPLY
      </IonButton>
      <IonButton onClick={handleLinkClick} style={{
        fontSize: 12,
      }}>
        LINK
      </IonButton>
      <IonButton id={'entryOptionsButton-' + props.entry.id}>
        <IonIcon icon={ellipsisVertical} size='small' />
      </IonButton>
      <IonPopover trigger={'entryOptionsButton-' + props.entry.id} triggerAction='click'>
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
              /g/{props.arrow.routeName}
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
      &nbsp;&nbsp;
      <span style={{
        whiteSpace: 'nowrap',
      }}>
        <IonButton onClick={handlePrevClick} style={{
          fontSize: 12,
          border: props.entry.showIns
            ? `1px solid ${arrowUser?.color}`
            : null,
          borderRadius: 5,
        }}>
          {props.arrow.inCount} IN
        </IonButton>
        &nbsp;
        <IonButton onClick={handleNextClick} style={{
          fontSize: 12,
          border: props.entry.showOuts
            ? `1px solid ${arrowUser?.color}`
            : null,
          borderRadius: 5,
        }}>
          {props.arrow.outCount} OUT
        </IonButton>
      </span>
    </IonButtons>
  )
}
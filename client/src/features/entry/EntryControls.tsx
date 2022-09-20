
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { updateEntry } from './entrySlice';
import { Twig } from '../twig/twig';
import useCenterTwig from '../twig/useCenterTwig';
import { Arrow } from '../arrow/arrow';
import useReplyEntry from './useReplyEntry';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';

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
  } = useContext(AppContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { replyEntry } = useReplyEntry(props.entry.id);

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
  //   event.stopPropagation();
  //   if (pendingLink.sourceId === props.entry.arrowId) {
  //     dispatch(setNewLink({
  //       sourcePostId: '',
  //       targetPostId: '',
  //     }));
  //   }
  //   else {
  //     dispatch(setNewLink({
  //       sourcePostId: props.entry.postId,
  //       targetPostId: '', 
  //     }));
  //   }
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
          Reply
        </IonButton>
        <IonButton onClick={handleLinkClick} style={{
          fontSize: 12,
        }}>
          Link
        </IonButton>
        <IonButton size='small'>
          <IonIcon icon={ellipsisVertical} size='small'/>
        </IonButton>
        &nbsp;&nbsp;
        <span style={{
          whiteSpace: 'nowrap',
        }}>
          <IonButton onClick={handlePrevClick} style={{
            fontSize: 12,
            border: props.entry.showIns
              ? `1px solid ${user?.color}`
              : null,
            borderRadius: 5,
          }}>
            {props.arrow.inCount} In
          </IonButton>
          &nbsp;
          <IonButton onClick={handleNextClick} style={{
            fontSize: 12,
            border: props.entry.showOuts
              ? `1px solid ${user?.color}`
              : null,
            borderRadius: 5,
          }}>
            {props.arrow.outCount} Out
          </IonButton>
        </span>
    </IonButtons>
  )
}
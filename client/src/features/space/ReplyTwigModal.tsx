import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from '@ionic/react';
import { useContext, useEffect, useRef } from 'react';
import { v4 } from 'uuid';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectArrowById } from '../arrow/arrowSlice';
import { addEntry } from '../entry/entrySlice';
import useReplyEntry from '../entry/useReplyEntry';
import { MenuMode } from '../menu/menu';
import { RoleType } from '../role/role';
import useRequestRole from '../role/useRequestRole';
import { searchPushSlice } from '../search/searchSlice';
import useReplyTwig from '../twig/useReplyTwig';
import { SpaceContext } from './SpaceComponent';
import { selectIdToTwig, selectTwigById } from './spaceSlice';

export default function ReplyTwigModal() {
  const dispatch = useAppDispatch();

  const {
    setMenuMode,
  } = useContext(AppContext);

  const { 
    abstractId,
    abstract,
    replyTwigId, 
    showReplyTwigModal,
    setShowReplyTwigModal,
  } = useContext(SpaceContext);


  const twig = useAppSelector(state => selectTwigById(state, abstractId, replyTwigId));
  const arrow = useAppSelector(state => selectArrowById(state, twig?.detailId));

  const isLink = twig?.sourceId !== twig?.targetId;

  const { replyEntry } = useReplyEntry();
  const { replyTwig } = useReplyTwig();
  const { requestRole } = useRequestRole(() => {
    if (arrow) {
      replyTwig(twig, arrow);
    }
  });

  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    if (showReplyTwigModal) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [showReplyTwigModal]);

  const handleSubscribeClick = (event: React.MouseEvent) => {
    requestRole(abstractId, RoleType.SUBSCRIBER);
    handleClose();
  }

  const handleReplyEntryClick = (event: React.MouseEvent) => {
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

    const entry = {
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
    }
    dispatch(addEntry(entry));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds: [id],
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH);
    handleClose();

    replyEntry(entry);
  }

  const handleClose = () => {
    setShowReplyTwigModal(false);
  };

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard style={{
        margin: 0,
        height: '100%',
      }}>
        <IonCardHeader style={{
          fontSize: 80,
          textAlign: 'center',
        }}>
          Reply...
        </IonCardHeader>
        <IonCardContent>
          <div style={{
            textAlign: 'center',
          }}>
            You must be {
              abstract?.canPost === RoleType.ADMIN
                ? 'an admin '
                : abstract?.canPost === RoleType.MEMBER
                  ? 'a member '
                  : abstract?.canPost === RoleType.SUBSCRIBER
                    ? 'a subscriber '
                    : 'the owner'
            }
            of this graph to post here.
          </div>
          {
            abstract?.canPost === RoleType.SUBSCRIBER && (
              <IonButtons style={{
                textAlign: 'center',
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <IonButton onClick={handleSubscribeClick}>
                  Subscribe + reply
                </IonButton>
                <IonButton onClick={handleClose}>
                  Cancel
                </IonButton>
              </IonButtons>
            )
              
          }
          <div style={{
            textAlign: 'center',
            marginTop: 60,
          }}>
            You can also reply to this post outside the context of this graph.
          <IonButtons style={{
            marginTop: 20,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <IonButton onClick={handleReplyEntryClick}>
              Reply
            </IonButton>
            &nbsp;
            &nbsp;
            <IonButton onClick={handleClose}>
              Cancel
            </IonButton>
          </IonButtons>
          </div>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}
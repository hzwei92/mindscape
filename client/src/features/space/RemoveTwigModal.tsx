import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from '@ionic/react';
import React, { useContext, useEffect, useRef } from 'react';
import { useAppSelector } from '../../app/store';
import useRemoveTwig from '../twig/useRemoveTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { SpaceContext } from './SpaceComponent';
import { selectIdToDescIdToTrue, selectIdToTwig } from './spaceSlice';

export default function RemoveTwigModal() {
  const { 
    abstractId,
    abstract,
    showRemoveTwigModal,
    removalTwigId, 
    setShowRemoveTwigModal,
    canEdit,
  } = useContext(SpaceContext);

  const idToTwig = useAppSelector(selectIdToTwig(abstractId)) ?? {}; 
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(abstractId)) ?? {};

  const removalTwig = idToTwig[removalTwigId];

  const isLink = removalTwig?.sourceId !== removalTwig?.targetId;

  const { removeTwig } = useRemoveTwig();
  const { selectTwig } = useSelectTwig(abstractId, canEdit);


  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    if (showRemoveTwigModal) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [showRemoveTwigModal]);


  const handleClose = () => {
    setShowRemoveTwigModal(false);
  };

  const handleRemoveSubtreeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!removalTwigId) return;

    if (!isLink && removalTwig.parent?.id) {
      selectTwig(abstract, idToTwig[removalTwig.parent.id]);
    }

    removeTwig(removalTwig, true);

    handleClose();
  }

  const descIds = Object.keys(idToDescIdToTrue[removalTwigId] || {});

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
          Remove...
        </IonCardHeader>
        <IonCardContent>
          <div style={{
            textAlign: 'center',
          }}>
            {
              descIds.length > 0 && (<div style={{
                marginBottom: 20,
              }}>
                This post has <b>{descIds.length} children</b> that will also be removed.
              </div>)
            }
            This does not delete posts or links, it merely detaches them from the graph.
            <br/>
            To delete a post or a link, access the More Option menu.
          </div>
          <IonButtons style={{
            marginTop: 60,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <IonButton onClick={handleRemoveSubtreeClick}>
              Remove
            </IonButton>
            &nbsp;
            &nbsp;
            <IonButton onClick={handleClose}>
              Cancel
            </IonButton>
          </IonButtons>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}
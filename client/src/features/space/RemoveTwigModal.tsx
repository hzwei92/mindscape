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
    removalTwigId, 
    setRemovalTwigId,
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
    if (removalTwigId) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [removalTwigId]);


  const handleClose = () => {
    setRemovalTwigId('');
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
        padding: 10,
      }}>
        <IonCardHeader>
          Remove
        </IonCardHeader>
        <IonCardContent>
          This does not delete the post, it merely removes it from this view.
          <br/>
          To delete a post open the More Options menu on the post.
          <br/>
          <br/>
          <IonButtons>
            <IonButton onClick={handleRemoveSubtreeClick}>
              Remove
              {
                isLink
                  ? ' Link'
                  : ' Post'
              }
              {
                descIds.length
                  ? ' Subtree'
                  : ''
              }
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
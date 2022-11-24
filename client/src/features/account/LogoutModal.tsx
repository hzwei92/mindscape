import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal, IonPage } from '@ionic/react';
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../app/App';
import useLogout from '../auth/useLogout';

interface LogoutModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
};

function LogoutModal(props: LogoutModalProps) {
  const { palette } = useContext(AppContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const { logoutUser } = useLogout();

  useEffect(() => {
    if (props.show) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [props.show]);

  const handleLogoutClick = () => {
    logoutUser();
    handleClose();
  }

  const handleCancelClick = () => {
    handleClose()
  }

  const handleClose = () => {
    props.setShow(false);
  }

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard style={{
        padding: 2,
        width: '100%',
        height: '100%',
        margin: 0,
      }}>
        <IonCardHeader>
          Logout
        </IonCardHeader>
        <IonCardContent>
          You will not be able to recover this account if you logout now
          without registering first.
          <br/>
          <br/>
          <IonButtons >
            <IonButton onClick={handleLogoutClick}>
              LOGOUT
            </IonButton>
            &nbsp;
            <IonButton onClick={handleCancelClick}>
              CANCEL
            </IonButton>
          </IonButtons>
        </IonCardContent>
      </IonCard>
    </IonModal>

  )
}

export default LogoutModal;
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal, IonPage } from '@ionic/react';
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../app/App';
import Register from '../auth/Register1';
import useLogout from '../auth/useLogout';
import { MenuMode } from '../menu/menu';

interface LogoutModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
};

function LogoutModal(props: LogoutModalProps) {
  const { user,  setMenuMode } = useContext(AppContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const { logoutUser } = useLogout();

  useEffect(() => {
    console.log('show logout modal', props.show);
    if (props.show) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [props.show]);

  const handleLogoutClick = () => {
    modalRef.current?.dismiss();
    handleClose();
    logoutUser();
    setMenuMode(MenuMode.NONE);
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
        <IonCardHeader style={{
          fontSize: 80,
          textAlign: 'center',
        }}>
          Peace out!
        </IonCardHeader>
        <IonCardContent style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {
            !user?.email
              ? <div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    You will not be able to recover this account if you logout now
                    without registering first.
                  </div>
                  <Register />
                </div>
              : null
          }
          <IonButtons style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 50,
          }}>
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
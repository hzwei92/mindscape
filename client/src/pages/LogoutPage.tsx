import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonPage } from '@ionic/react';
import { useContext } from 'react';
import { AppContext } from '../app/App';
import useLogout from '../features/auth/useLogout';

const LogoutPage: React.FC = () =>  {
  const { palette } = useContext(AppContext);

  const { logoutUser } = useLogout();

  const handleLogoutClick = () => {
    logoutUser();
  }

  const handleCancelClick = () => {
  }

  return (
    <IonPage style={{
      marginTop: 56,
      backgroundColor: palette === 'dark'
        ? '#000000'
        : '#e0e0e0',
    }}>
      <IonCard style={{
        padding: 2,
        width: 350,
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
            <IonButton routerLink='/about' onClick={handleLogoutClick}>
              LOGOUT
            </IonButton>
            &nbsp;
            <IonButton routerLink='/about' onClick={handleCancelClick}>
              CANCEL
            </IonButton>
          </IonButtons>
        </IonCardContent>
      </IonCard>
    </IonPage>

  )
}

export default LogoutPage;
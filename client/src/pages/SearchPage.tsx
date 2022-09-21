import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useContext } from 'react';
import { AppContext } from '../app/App';
import SearchComponent from '../features/search/SearchComponent';

const SearchPage: React.FC = () => {
  const { palette } = useContext(AppContext);
  return (
    <IonPage style={{
      backgroundColor: palette === 'dark'
        ? '#000000'
        : '#e0e0e0',
      height: 'calc(100% - 56px)',
      top: 56,
    }}>
      <SearchComponent />
    </IonPage>
  );
};

export default SearchPage;

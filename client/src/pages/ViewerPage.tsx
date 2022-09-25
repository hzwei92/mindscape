import { IonPage } from '@ionic/react';
import { SpaceType } from '../features/space/space';
import SpaceComponent from '../features/space/SpaceComponent';

const VeiwerPage: React.FC = () => {
  return (
    <IonPage>
      <SpaceComponent space={SpaceType.FOCUS} />
    </IonPage>
  );
};

export default VeiwerPage;

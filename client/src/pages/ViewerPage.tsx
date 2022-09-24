import { IonPage } from '@ionic/react';
import useAppRouter from '../app/useAppRouter';
import { SpaceType } from '../features/space/space';
import SpaceComponent from '../features/space/SpaceComponent';
import useReplyTwigSub from '../features/twig/useReplyTwigSub';

const VeiwerPage: React.FC = () => {
  useAppRouter();
  return (
    <IonPage>
      <SpaceComponent space={SpaceType.FOCUS} />
    </IonPage>
  );
};

export default VeiwerPage;

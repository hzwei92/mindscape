import { IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonPage } from '@ionic/react';
import { useContext } from 'react';
import { AppContext } from '../app/App';

const AboutPage: React.FC = () => {
  const { palette } = useContext(AppContext);

  return (
    <IonPage>
      <IonCard style={{
        backgroundColor: palette === 'dark'
          ? '#000000'
          : '#e0e0e0',
        height: 'calc(100% - 56px)',
        top: 56,
        margin: 0,
        borderRadius: 0,
      }}>
        <IonCardHeader>
          About
        </IonCardHeader>
        <IonCardContent>
          <IonCard style={{
            padding: 10,
            margin: 0,
          }}>
            <p>
              Browse the Web as a weighted directed graph.
            </p>
            <br/>
            <p>
              Each graph is a node that has been opened for the viewing of its contents.
            </p>
            <br/>
            <p>
              Each graph has a directory tree, indicated by the solid lines between nodes.
            </p>
            <br/>
            <p>
              Collect and share your favorite graphs.
            </p>
            <br/>
            <p>
              The graphs you are viewing are numbered in the top right.
            </p>
          </IonCard>
        </IonCardContent>
      </IonCard>
    </IonPage>
  );
};

export default AboutPage;

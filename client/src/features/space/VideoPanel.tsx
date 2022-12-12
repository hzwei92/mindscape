
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { SpaceContext } from './SpaceComponent';
import { SPACE_PANEL_WIDTH } from '../../constants';
import { AppContext } from '../../app/App';
import { IonCard, IonCardContent, IonCardHeader } from '@ionic/react';
import { 
  LocalParticipant, 
  RemoteParticipant,
  LocalTrackPublication,
  RemoteTrackPublication,
  LocalTrack,
  RemoteTrack,
} from 'twilio-video';

interface VideoPanelProps {
  showVideo: boolean;
  setShowVideo: Dispatch<SetStateAction<boolean>>;
}
export default function VideoPanel(props: VideoPanelProps) {
  const { 
    room,
  } = useContext(AppContext);

  const {
    abstract,
  } = useContext(SpaceContext);

  const [participants, setParticpants] = useState<any[]>([]);

  const handleTrackPublication = (trackPublication: RemoteTrackPublication, participant: RemoteParticipant) => {
    function displayTrack(track: any) {
      const participantDiv = document.getElementById('participant-' + participant.identity);
      participantDiv?.append(track.attach());
    }
    if (trackPublication.track) {
      displayTrack(trackPublication.track);
    }

    trackPublication.on('subscribed', displayTrack);
  };

  const handleConnectedParticipant = (participant: RemoteParticipant) => {
    setParticpants(val => [...val, participant]);
    participant.tracks.forEach(trackPublication => {
      handleTrackPublication(trackPublication, participant);
    })
    participant.on('trackPublished', handleTrackPublication);
  };

  const handleDisconnectedParticipant = (participant: RemoteParticipant) => {
    participant.removeAllListeners();
    setParticpants(val => val.filter(p => p.identity !== participant.identity));
  };

  useEffect(() => {
    if (!room) return;
    handleConnectedParticipant(room.localParticipant as any);
    room.participants.forEach(handleConnectedParticipant);
    room.on('participantConnected', handleConnectedParticipant);
    room.on('participantDisconnected', handleDisconnectedParticipant);
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());
  }, [room])

  if (!abstract) return null;

  return (
    <IonCard style={{
      margin: 10,
      marginLeft: 0,
      marginRight: 0,
      width: SPACE_PANEL_WIDTH,
      height: 'calc(100% - 60px)',
      overflowY: 'scroll',
    }}>
      <IonCardHeader>
        VIDEO CALL
      </IonCardHeader>
      <IonCardContent>
        <div id={'participant-'+ room?.localParticipant.identity}/>
        {
          participants.map(p => (
            <div key={p.identity} id={'participant-' + p.identity} style={{
              width: '100%',
            }}/>
          ))
        }
      </IonCardContent>
    </IonCard>
  )
}
import { useContext, useState } from 'react';
import type { Arrow } from './arrow';
import { Vote } from '../vote/vote';
import { selectVotesByArrowId } from '../vote/voteSlice';
import { AppContext } from '../../app/App';
import { useAppSelector } from '../../app/store';
import useVoteArrow from '../vote/useVoteArrow';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { caretDownOutline, caretUpOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
interface ArrowVoterProps {
  arrow: Arrow;
}
export default function ArrowVoter(props: ArrowVoterProps) {
  const { 
    user,
  } = useContext(AppContext);

  const [isVoting, setIsVoting] = useState(false);

  const votes = useAppSelector(state => selectVotesByArrowId(state, props.arrow.id));

  let userVote = null as Vote | null;
  votes.some(vote => {
    if (vote && !vote.deleteDate && vote.userId === user?.id) {
      userVote = vote;
    }
    return !!userVote;
  });

  const { voteArrow } = useVoteArrow(() => {
    setIsVoting(false);
  });


  const handleVoteClick = (clicks: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsVoting(true);
    voteArrow(props.arrow.id, clicks);
  }

  const handleButtonMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '7px',
      marginLeft: '-4px',
    }}>
      <IonButtons style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <IonButton
          disabled={isVoting || userVote?.weight === 10}
          size='small' 
          onMouseDown={handleButtonMouseDown}
          onClick={handleVoteClick(
            userVote
              ? userVote?.weight + 1
              : 1
          )}
          style={{
            color: (userVote?.weight || 0) > 0
              ? user?.color
              : null,
          }}
        >
          { 
            (userVote?.weight || 0) > 0
              ? <IonIcon icon={caretUpOutline} />
              : <IonIcon icon={chevronUpOutline} size='small' />
          }
        </IonButton>
        <IonButton
          disabled={isVoting}
          onMouseDown={handleButtonMouseDown}
          color='inherit'
          size='small'
          title={`${(userVote?.weight || 0) > 0 ? '+' : ''}${userVote?.weight || 0}`}
          style={{
            minWidth: '40px',
            fontSize: 14,
          }}
        >
          { props.arrow.weight }
        </IonButton>
        <IonButton
          onMouseDown={handleButtonMouseDown}
          disabled={isVoting || userVote?.weight === -10}
          size='small' 
          onClick={handleVoteClick(
            userVote
              ? userVote?.weight - 1
              : -1
          )}
          style={{
            color: (userVote?.weight || 0) < 0
              ? user?.color
              : null,
          }}
        >
          {
            (userVote?.weight || 0) < 0
              ? <IonIcon icon={caretDownOutline} />
              : <IonIcon icon={chevronDownOutline} size='small' />
          }
        </IonButton>
      </IonButtons>
    </div>
  )
}
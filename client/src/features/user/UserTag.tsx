import type { User } from './user';
import md5 from 'md5';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { IonAvatar, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircle, checkmarkCircleOutline, ellipseOutline } from 'ionicons/icons';
import { useAppSelector } from '../../app/store';
import { selectIdToLead, selectLeaderIdToLeadId } from '../lead/leadSlice';

interface UserTagProps {
  user: User | null;
  fontSize: number;
}
export default function UserTag(props: UserTagProps) {
  const { user, setSelectedUserId }  = useContext(AppContext);

  const idToLead = useAppSelector(selectIdToLead);
  const leaderIdToLeadId = useAppSelector(selectLeaderIdToLeadId);
  const lead = idToLead[leaderIdToLeadId[props.user?.id || '']];
  const isFollowing = !!lead?.id && !lead.deleteDate;

  const handleUserClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  
    if (props.user) {
      setSelectedUserId(props.user.id);
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  return(
    <div onMouseDown={handleMouseDown} style={{
      display: 'inline-flex',
      whiteSpace: 'nowrap',
      fontSize: props.fontSize,
    }}>
      {
        props.user?.verifyEmailDate && props.user?.email
          ? <img 
              src={`https://www.gravatar.com/avatar/${md5(props.user.email)}?d=retro`}
              style={{
                marginRight: 1,
                marginTop: 1,
                borderRadius: 5,
                border: `1px solid ${props.user.color}`,
                width: props.fontSize,
                height: props.fontSize,
              }}
            />
          : null
      }
      <span color={props.user?.color} onClick={handleUserClick}
        style={{
          color: props.user?.color,
          cursor: 'pointer',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: props.fontSize,
        }}
      >
        {props.user?.name}
      </span>
      {
        isFollowing
          ? <IonIcon icon={checkmarkCircle} style={{
              marginLeft: 2,
              marginTop: 1,
              color: user?.color || null,
              fontSize: props.fontSize,
            }}/>
          : null
      }
    </div>
  )
}
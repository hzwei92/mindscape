import type { User } from './user';
import md5 from 'md5';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { IonAvatar, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, ellipseOutline } from 'ionicons/icons';

interface UserTagProps {
  user: User | null;
}
export default function UserTag(props: UserTagProps) {
  const { user, setSelectedUserId }  = useContext(AppContext);
  const isFollowing = false //(props.user?.leaders || [])
    // .some(lead => !lead.deleteDate && lead.leaderId === props.user.id);


  //const { followUser } = useFollowUser();
  //const { unfollowUser } = useUnfollowUser();

  const handleUnfollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //unfollowUser(props.user.id);
  }

  const handleFollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //followUser(props.user.id);
  }

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
    <span onMouseDown={handleMouseDown} style={{
      whiteSpace: 'nowrap'
    }}>
      {
        props.user?.verifyEmailDate
          ? <IonAvatar
              style={{
                display: 'inline-block',
                marginBottom: '-2px',
                marginRight: '4px',
                width: 17,
                height: 17,
                border: `1px solid ${props.user.color}`
              }}
            >
              <img 
                src={`https://www.gravatar.com/avatar/${md5(props.user.email)}?d=retro`}
                style={{
                  width: 17,
                  height: 17,
                }}
              />
            </IonAvatar>
          : null
      }
      <span color={props.user?.color} onClick={handleUserClick}
        style={{
          color: props.user?.color,
          cursor: 'pointer'
        }}
      >
        {props.user?.name}
      </span>
      {
        props.user?.id === props.user?.id
          ? null
          : <span>
              {
                isFollowing
                  ? <IonButton
                      onClick={handleUnfollowClick}
                      title={`Unfollow u/${props.user?.name}`}
                      size='small'
                      style={{
                        marginTop: '-3px',
                        marginLeft: '2px',
                        padding: 0,
                        fontSize: 14,
                      }}
                    >
                      <IonIcon icon={checkmarkCircleOutline} style={{
                        color: props.user?.color || null,
                      }}/>
                    </IonButton>
                  : <IonButton
                      onClick={handleFollowClick}
                      title={`Follow ${props.user?.name}`}
                      size='small' 
                      style={{
                        marginTop: '-1px',
                        marginLeft: '2px',
                        padding: 0,
                        fontSize: 10,
                      }}
                    >
                      <IonIcon icon={ellipseOutline} style={{
                      }}/>
                    </IonButton>
              }
            </span>
      }
    </span>
  )
}
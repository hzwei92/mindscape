import type { User } from './user';
import md5 from 'md5';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { IonAvatar, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, ellipseOutline } from 'ionicons/icons';

interface UserTagProps {
  user: User | null;
  fontSize: number;
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
      whiteSpace: 'nowrap',
      fontSize: props.fontSize,
    }}>
      {
        props.user?.verifyEmailDate
          ? <img 
              src={`https://www.gravatar.com/avatar/${md5(props.user.email)}?d=retro`}
              style={{
                marginRight: 2,
                marginBottom: -1,
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
                        fontSize: props.fontSize,
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
                        fontSize: props.fontSize,
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
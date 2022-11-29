
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { SPACE_BAR_HEIGHT, SPACE_PANEL_WIDTH } from '../../constants';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal, isPlatform } from '@ionic/react';
import UserTag from '../user/UserTag';


interface RolesPanelProps {
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function RolesPanel(props: RolesPanelProps) {
  const { 
    user,
  } = useContext(AppContext);

  const {
    abstract,
    role,
  } = useContext(SpaceContext);

  const admins: Role[] = [];
  const members: Role[] = [];
  const subscribers: Role[] = [];
  const others: Role[] = [];
  (abstract?.roles || [])
    .filter(role_i => !role_i.deleteDate)
    .sort((a, b) => a.updateDate < b.updateDate ? -1 : 1)
    .forEach(role_i => {
      if (role_i.type === RoleType.ADMIN) {
        if (role_i.userId !== abstract?.userId) {
          admins.push(role_i);
        }
      }
      else if (role_i.type === RoleType.MEMBER) {
        members.push(role_i);
      }
      else if (role_i.type === RoleType.SUBSCRIBER) {
        subscribers.push(role_i);
      }
      else {
        others.push(role_i);
      }
    });

  const [isInviting, setIsInviting] = useState(false);
  const canInvite = role && (role.type === 'ADMIN' || role.type === 'MEMBER')

  // const { requestRole } = useRequestRole();
  // const { inviteRole } = useInviteRole(props.jam.id, () => {});
  // const { removeRole } = useRemoveRole();

  const handleInviteClick = (event: React.MouseEvent) => {
    setIsInviting(true);
  }
  const handleJoinClick = (event: React.MouseEvent) => {
    //requestRole(props.jam.id);
  }
  const handleApproveClick = (userName: string) => (event: React.MouseEvent) => {
    //inviteRole(userName);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    //removeRole(roleId)
  }

  const handleUserClick = (userId: string) => (event: React.MouseEvent) => {

  }

  const handleClose = () => {
    props.setShowRoles(false);
  };

  if (!abstract) return null;

  return (
    <IonCard style={{
      marginLeft: 0,
      width: SPACE_PANEL_WIDTH,
    }}>
      <IonCardContent>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Owner - 1 
        </div>
        <div style={{
          padding: 10,
        }}>
          <UserTag user={abstract.user} fontSize={16}/>
        </div>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Admins - {admins.length}
        </div>
        {
          admins.map(role_i => {
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 10,
              }}>
                <UserTag user={role_i.user} fontSize={16} />
              </div>
            );
          })
        }
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Members - {members.length}
        </div>
        {
          members.map(role_i => {
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 10,
              }}>
                <UserTag user={role_i.user} fontSize={16} />
              </div>
            );
          })
        }
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Subscribers - {subscribers.length}
        </div>
        {
          subscribers.map(role_i => {
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 10,
              }}>
                <UserTag user={role_i.user} fontSize={16} />
              </div>
            );
          })
        }
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Others - {others.length}
        </div>
        {
          others.map(role_i => {
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 10,
              }}>
                <UserTag user={role_i.user} fontSize={16} />
              </div>
            );
          })
        }
      </IonCardContent>
    </IonCard>
  )
}
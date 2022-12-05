
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { SPACE_BAR_HEIGHT, SPACE_PANEL_WIDTH } from '../../constants';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal, isPlatform } from '@ionic/react';
import UserTag from '../user/UserTag';
import { checkPermit, getTimeString } from '../../utils';
import { useAppSelector } from '../../app/store';
import { selectIdToRole } from './spaceSlice';
import { selectIdToUser } from '../user/userSlice';
import useGetRolesByArrowId from '../role/useGetRolesByArrowId';


interface RolesPanelProps {
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function RolesPanel(props: RolesPanelProps) {
  const { 
    user,
  } = useContext(AppContext);

  const {
    abstractId,
    abstract,
    role,
  } = useContext(SpaceContext);

  const { getRolesByArrowId } = useGetRolesByArrowId();

  useEffect(() => {
    getRolesByArrowId(abstractId);
  }, [abstractId]);

  const idToRole = useAppSelector(selectIdToRole(abstractId)) ?? {};

  const idToUser = useAppSelector(selectIdToUser);

  const admins: Role[] = [];
  const members: Role[] = [];
  const subscribers: Role[] = [];
  const others: Role[] = [];
  Object.values(idToRole || {})
    .filter(role_i => !role_i.deleteDate)
    .sort((a, b) => a.user?.activeDate > b.user?.activeDate ? -1 : 1)
    .forEach(role_i => {
      const role1 = idToRole[role_i.id];
      if (!role1) return;
      
      if (role1.type === RoleType.ADMIN) {
        if (role1.userId !== abstract?.userId) {
          admins.push(role1);
        }
      }
      else if (role1.type === RoleType.MEMBER) {
        members.push(role1);
      }
      else if (role1.type === RoleType.SUBSCRIBER) {
        subscribers.push(role1);
      }
      else {
        others.push(role1);
      }
    });

  const [isInviting, setIsInviting] = useState(false);
  const canInvite = checkPermit(abstract?.canAssignMemberRole, role?.type);

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

  const time = new Date(abstract?.user?.activeDate ?? Date.now()).getTime()
  const timeString = getTimeString(time);

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
      <IonCardContent>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Owner - 1 
        </div>
        <div style={{
          padding: 5,
          display: 'flex',
          flexDirection: 'row',
        }}>
          <UserTag user={abstract.user} fontSize={14}/>
          &nbsp;
          { abstract.user ? timeString : null }
        </div>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Admins - {admins.length}
        </div>
        {
          admins.map(role_i => {
            const user1 = idToUser[role_i.userId];
            if (!user1) return null;
            const time1 = new Date(user1?.activeDate ?? Date.now()).getTime()
            const timeString1 = getTimeString(time1);
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 5,
                display: 'flex',
                flexDirection: 'row',
              }}>
                <UserTag user={user1} fontSize={14} />
                &nbsp;
                { timeString1 }
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
            const user1 = idToUser[role_i.userId];

            if (!user1) return null;

            const time1 = new Date(user1?.activeDate ?? Date.now()).getTime()
            const timeString1 = getTimeString(time1);
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 5,
                display: 'flex',
                flexDirection: 'row',
              }}>
                <UserTag user={user1} fontSize={14} />
                &nbsp;
                { timeString1 }
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
            const user1 = idToUser[role_i.userId];
            if (!user1) return null;
            const time1 = new Date(user1?.activeDate ?? Date.now()).getTime()
            const timeString1 = getTimeString(time1);
            return (
              <div key={'role-'+role_i.id} style={{
                padding: 5,
                display: 'flex',
                flexDirection: 'row',
              }}>
                <UserTag user={user1} fontSize={14} />
                &nbsp;
                { timeString1 }
              </div>
            );
          })
        }
      </IonCardContent>
    </IonCard>
  )
}
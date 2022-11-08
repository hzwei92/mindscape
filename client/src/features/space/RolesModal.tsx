
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { SPACE_BAR_HEIGHT } from '../../constants';
import { AppContext } from '../../app/App';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonModal } from '@ionic/react';


interface RolesModalProps {
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function RolesModal(props: RolesModalProps) {
  const { 
    user,
  } = useContext(AppContext);

  const {
    abstract,
    role,
  } = useContext(SpaceContext);

  const admins: Role[] = [];
  const members: Role[] = [];
  const others: Role[] = [];
  (abstract?.roles || [])
    .filter(role_i => !role_i.deleteDate)
    .sort((a, b) => a.updateDate < b.updateDate ? -1 : 1)
    .forEach(role_i => {
      if (role_i.type === RoleType.ADMIN) {
        if (role_i.userId !== user?.id) {
          admins.push(role_i);
        }
      }
      else if (role_i.type === RoleType.MEMBER) {
        members.push(role_i);
      }
      else {
        others.push(role_i);
      }
    });

  const modalRef = useRef<HTMLIonModalElement>(null);

  const [isInviting, setIsInviting] = useState(false);
  const canInvite = role && (role.type === 'ADMIN' || role.type === 'MEMBER')

  useEffect(() => {
    if (props.showRoles) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  })

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
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <div style={{
        padding: 10,
      }}>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          {
            canInvite
              ? <div>
                  {
                    isInviting 
                      ? <div>
                        </div>
                      : <IonButtons>
                          <IonButton onClick={handleInviteClick}>
                            INVITE
                          </IonButton>
                        </IonButtons>
                  }
                </div>
              : role && role.isRequested
                ? null
                : <div>
                    {
                      role && role.isInvited
                        ? <IonButtons>
                            <IonButton disabled={!user} onClick={handleJoinClick}>
                              JOIN
                            </IonButton>
                          </IonButtons>
                        : <IonButtons>
                            <IonButton disabled={!user} onClick={handleJoinClick}>
                              REQUEST MEMBERSHIP
                            </IonButton>
                          </IonButtons>
                    }
                  </div>
          }
        </IonCard>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          <IonCardHeader>
            Owner
          </IonCardHeader>
          <IonCardContent>
            <div onClick={handleUserClick(abstract.userId)} style={{
              cursor: 'pointer',
            }}>
              {abstract.user.name || '...'}
            </div>
          </IonCardContent>
        </IonCard>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          <IonCardHeader>
            Admins
          </IonCardHeader>
          <IonCardContent>
            <div onClick={handleUserClick(abstract.userId)} style={{
              cursor: 'pointer',
            }}>
              {
                admins.map(role_i => {
                  return (
                    <IonCard key={`role-${role_i.id}`} style={{
                      padding: 1,
                    }}>
                      <div color={role_i.user.color} onClick={handleUserClick(role_i.userId)} style={{
                        color: role_i.user.color,
                        cursor: 'pointer',
                      }}>
                        {role_i.user.name || '...'}
                      </div>
                    </IonCard>
                  )
                })
              }
            </div>
          </IonCardContent>
        </IonCard>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          <IonCardHeader>
            Editors
          </IonCardHeader>
          <IonCardContent>          
            {
              members.map(role_i => {
                return (
                  <IonCard key={`role-${role_i.id}`} style={{
                    padding: 1,
                  }}>
                    <div color={role_i.user.color} onClick={handleUserClick(role_i.userId)} style={{
                      color: role_i.user.color,
                      cursor: 'pointer',
                    }}>
                      {role_i.user.name || '...'}
                    </div>
                  </IonCard>
                )
              })
            }
          </IonCardContent>
        </IonCard>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          <IonCardHeader>
            Other
          </IonCardHeader>
          <IonCardContent>
          {
            others.map(role_i => {
              return (
                <IonCard key={`role-${role_i.id}`} style={{
                  padding: 1,
                }}>
                  <div  color={role_i.user.color} onClick={handleUserClick(role_i.userId)} style={{
                    color: role_i.user.color,
                    cursor: 'pointer',
                  }}>
                    {role_i.user.name || '...'}
                  </div>
                </IonCard>
              )
            })
          }
          </IonCardContent>
        </IonCard>
      </div>
    </IonModal>
  )
}
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { ChromePicker } from 'react-color';
import useSetArrowColor from '../arrow/useSetArrowColor';
import { AppContext } from '../../app/App';
import { IonCard, IonCardContent, IonCardHeader, IonCheckbox, IonItem, IonLabel, IonModal } from '@ionic/react';
import { SPACE_PANEL_WIDTH } from '../../constants';
import useSetArrowPermissions from '../arrow/useSetArrowPermissions';

interface SettingsPanelProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsPanel(props: SettingsPanelProps) {
  const { 
    user,
  } = useContext(AppContext);

  const {
    role,
    abstract,
  } = useContext(SpaceContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const { setArrowColor } = useSetArrowColor();

  const { setArrowPermissions } = useSetArrowPermissions();

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

  const [color, setColor] = useState(abstract?.color);
  const [colorTimeout, setColorTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = abstract?.userId === user?.id || role?.type === 'ADMIN';

  const [canAdminAssignRoles, setCanAdminAssignRoles] = useState(true);
  const [canAdminEditLayout, setCanAdminEditLayout] = useState(true);
  const [canAdminPost, setCanAdminPost] = useState(true);

  const [canMemberAssignRoles, setCanMemberAssignRoles] = useState(false);
  const [canMemberEditLayout, setCanMemberEditLayout] = useState(true);
  const [canMemberPost, setCanMemberPost] = useState(true);

  const [canSubscriberAssignRoles, setCanSubscriberAssignRoles] = useState(false);
  const [canSubscriberEditLayout, setCanSubscriberEditLayout] = useState(false);
  const [canSubscriberPost, setCanSubscriberPost] = useState(true);
  
  const [canOtherAssignRoles, setCanOtherAssignRoles] = useState(false);
  const [canOtherEditLayout, setCanOtherEditLayout] = useState(false);
  const [canOtherPost, setCanOtherPost] = useState(false);

  useEffect(() => {
    if (!abstract?.color) return;

    setColor(abstract.color);
  }, [abstract?.color])

  useEffect(() => {
    if (abstract?.canAssignRoles === RoleType.ADMIN) {
      setCanAdminAssignRoles(true);
      setCanMemberAssignRoles(false);
      setCanSubscriberAssignRoles(false);
      setCanOtherAssignRoles(false);
    }
    else if (abstract?.canAssignRoles === RoleType.MEMBER) {
      setCanAdminAssignRoles(true);
      setCanMemberAssignRoles(true);
      setCanSubscriberAssignRoles(false);
      setCanOtherAssignRoles(false);
    }
    else if (abstract?.canAssignRoles === RoleType.SUBSCRIBER) {
      setCanAdminAssignRoles(true);
      setCanMemberAssignRoles(true);
      setCanSubscriberAssignRoles(true);
      setCanOtherAssignRoles(false);
    }
    else {
      setCanAdminAssignRoles(true);
      setCanMemberAssignRoles(true);
      setCanSubscriberAssignRoles(true);
      setCanOtherAssignRoles(true);
    }
  }, [abstract?.canAssignRoles]);

  useEffect(() => {
    if (abstract?.canEditLayout === RoleType.ADMIN) {
      setCanAdminEditLayout(true);
      setCanMemberEditLayout(false);
      setCanSubscriberEditLayout(false);
      setCanOtherEditLayout(false);
    }
    else if (abstract?.canEditLayout === RoleType.MEMBER) {
      setCanAdminEditLayout(true);
      setCanMemberEditLayout(true);
      setCanSubscriberEditLayout(false);
      setCanOtherEditLayout(false);
    }
    else if (abstract?.canEditLayout === RoleType.SUBSCRIBER) {
      setCanAdminEditLayout(true);
      setCanMemberEditLayout(true);
      setCanSubscriberEditLayout(true);
      setCanOtherEditLayout(false);
    }
    else {
      setCanAdminEditLayout(true);
      setCanMemberEditLayout(true);
      setCanSubscriberEditLayout(true);
      setCanOtherEditLayout(true);
    }
  }, [abstract?.canEditLayout]);

  useEffect(() => {
    if (abstract?.canPost === RoleType.ADMIN) {
      setCanAdminPost(true);
      setCanMemberPost(false);
      setCanSubscriberPost(false);
      setCanOtherPost(false);
    }
    else if (abstract?.canPost === RoleType.MEMBER) {
      setCanAdminPost(true);
      setCanMemberPost(true);
      setCanSubscriberPost(false);
      setCanOtherPost(false);
    }
    else if (abstract?.canPost === RoleType.SUBSCRIBER) {
      setCanAdminPost(true);
      setCanMemberPost(true);
      setCanSubscriberPost(true);
      setCanOtherPost(false);
    }
    else {
      setCanAdminPost(true);
      setCanMemberPost(true);
      setCanSubscriberPost(true);
      setCanOtherPost(true);
    }
  }, [abstract?.canPost]);

  useEffect(() => {
    if (props.showSettings) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [props.showSettings]);

  const handleColorChange = (color: any) => {
    if (!isAdmin) return; 
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (!isAdmin) return;
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setColorTimeout(null);
      if (!abstract) return;
      setArrowColor(abstract.id, color.hex);
    }, 500);
    setColorTimeout(timeout);
  };

  const handleClose = () => {
    props.setShowSettings(false);
  }

  const handleCanAssignRolesClick = (roleType: RoleType) => (e: any) => {
    if (!abstract) return;

    if (e.detail.checked) {
      setArrowPermissions(abstract.id, roleType, null, null);
    }
    else {
      if (roleType === RoleType.ADMIN) {
        setArrowPermissions(abstract.id, RoleType.NONE, null, null);
      }
      else if (roleType === RoleType.MEMBER) {
        setArrowPermissions(abstract.id, RoleType.ADMIN, null, null);
      }
      else if (roleType === RoleType.SUBSCRIBER) {
        setArrowPermissions(abstract.id, RoleType.MEMBER, null, null);
      }
      else if (roleType === RoleType.OTHER) {
        setArrowPermissions(abstract.id, RoleType.SUBSCRIBER, null, null);
      }
    }
  }

  const handleCanEditLayoutClick = (roleType: RoleType) => (e: any) => {
    if (!abstract) return;

    if (e.detail.checked) {
      setArrowPermissions(abstract.id, null, roleType, null);
    }
    else {
      if (roleType === RoleType.ADMIN) {
        setArrowPermissions(abstract.id, null, RoleType.NONE, null);
      }
      else if (roleType === RoleType.MEMBER) {
        setArrowPermissions(abstract.id, null, RoleType.ADMIN, null);
      }
      else if (roleType === RoleType.SUBSCRIBER) {
        setArrowPermissions(abstract.id, null, RoleType.MEMBER, null);
      }
      else if (roleType === RoleType.OTHER) {
        setArrowPermissions(abstract.id, null, RoleType.SUBSCRIBER, null);
      }
    }
  }

  const handleCanPostClick = (roleType: RoleType) => (e: any) => {
    if (!abstract) return;

    if (e.detail.checked) {
      setArrowPermissions(abstract.id, null, null, roleType);
    }
    else {
      if (roleType === RoleType.ADMIN) {
        setArrowPermissions(abstract.id, null, null, RoleType.NONE);
      }
      else if (roleType === RoleType.MEMBER) {
        setArrowPermissions(abstract.id, null, null, RoleType.ADMIN);
      }
      else if (roleType === RoleType.SUBSCRIBER) {
        setArrowPermissions(abstract.id, null, null, RoleType.MEMBER);
      }
      else if (roleType === RoleType.OTHER) {
        setArrowPermissions(abstract.id, null, null, RoleType.SUBSCRIBER);
      }
    }
  }


  if (!abstract) return null;

  return (
    <IonCard style={{
      width: SPACE_PANEL_WIDTH,
      height: 'calc(100% - 70px)',
      overflowY: 'scroll',
    }}>
      <IonCardContent>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Color
        </div>
        <div style={{
          padding: 5,
        }}>
          <ChromePicker
            color={color}
            disableAlpha={true}
            onChange={handleColorChange}
            onChangeComplete={handleColorChangeComplete}
          />
        </div>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
          paddingBottom: 5,
        }}>
          Permissions
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Admins</b> 
          <IonItem style={{
          }}>
            <IonCheckbox checked={canAdminAssignRoles} onIonChange={handleCanAssignRolesClick(RoleType.ADMIN)}/>
            <IonLabel>&nbsp;can assign roles</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canAdminEditLayout} onIonChange={handleCanEditLayoutClick(RoleType.ADMIN)}/>
            <IonLabel>&nbsp;can edit layout</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canAdminPost} onIonChange={handleCanPostClick(RoleType.ADMIN)}/>
            <IonLabel>&nbsp;can post</IonLabel>
          </IonItem>
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Members</b>
          <IonItem>
            <IonCheckbox checked={canMemberAssignRoles} onIonChange={handleCanAssignRolesClick(RoleType.MEMBER)}/>
            <IonLabel>&nbsp;can assign roles</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canMemberEditLayout} onIonChange={handleCanEditLayoutClick(RoleType.MEMBER)} />
            <IonLabel>&nbsp;can edit layout</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canMemberPost} onIonChange={handleCanPostClick(RoleType.MEMBER)} />
            <IonLabel>&nbsp;can post</IonLabel>
          </IonItem>
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Subscribers</b>
          <IonItem>
            <IonCheckbox checked={canSubscriberAssignRoles} onIonChange={handleCanAssignRolesClick(RoleType.SUBSCRIBER)}/>
            <IonLabel>&nbsp;can assign roles</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canSubscriberEditLayout} onIonChange={handleCanEditLayoutClick(RoleType.SUBSCRIBER)}/>
            <IonLabel>&nbsp;can edit layout</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canSubscriberPost} onIonChange={handleCanPostClick(RoleType.SUBSCRIBER)}/>
            <IonLabel>&nbsp;can post</IonLabel>
          </IonItem>
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Others</b>
          <IonItem>
            <IonCheckbox checked={canOtherAssignRoles} onIonChange={handleCanAssignRolesClick(RoleType.OTHER)}/>
            <IonLabel>&nbsp;can assign roles</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canOtherEditLayout} onIonChange={handleCanEditLayoutClick(RoleType.OTHER)}/>
            <IonLabel>&nbsp;can edit layout</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox checked={canOtherPost} onIonChange={handleCanPostClick(RoleType.OTHER)}/>
            <IonLabel>&nbsp;can post</IonLabel>
          </IonItem>
        </div>
      </IonCardContent>
    </IonCard>
  )
}
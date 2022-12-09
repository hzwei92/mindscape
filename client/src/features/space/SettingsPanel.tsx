import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { ChromePicker } from 'react-color';
import useSetArrowColor from '../arrow/useSetArrowColor';
import { AppContext } from '../../app/App';
import { IonCard, IonCardContent, IonCardHeader, IonCheckbox, IonInput, IonItem, IonLabel, IonModal } from '@ionic/react';
import { SPACE_PANEL_WIDTH } from '../../constants';
import useSetArrowPermissions from '../arrow/useSetArrowPermissions';
import { checkPermit } from '../../utils';
import useSetArrowTitle from '../arrow/useSetArrowTitle';

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

  const { setArrowTitle } = useSetArrowTitle();
  const { setArrowColor } = useSetArrowColor();
  const { setArrowPermissions } = useSetArrowPermissions();

  useEffect(() => {
    if (!abstract?.color) return;

    setColor(abstract.color);
  }, [abstract?.color])


  useEffect(() => {
    if (props.showSettings) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [props.showSettings]);

  const [name, setName] = useState(abstract?.title ?? '');
  const [nameTimeout, setNameTimeout] = useState<ReturnType<typeof setTimeout>>();

  const [color, setColor] = useState(abstract?.color);
  const [colorTimeout, setColorTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  const isAdmin = abstract?.userId === user?.id || role?.type === 'ADMIN';


  const handleNameChange = (e: any) => {
    if (!isAdmin) return;

    setName(e.target.value);

    if (nameTimeout) {
      clearTimeout(nameTimeout);
    }
    const timeout = setTimeout(() => {
      if (!abstract) return;
      setArrowTitle(abstract.id, e.target.value);
      setNameTimeout(undefined);
    }, 500);

    setNameTimeout(timeout);
  }

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

  const handleCanAssignMemberRoleClick = (roleType: RoleType) => (e: any) => {
    e.preventDefault();
    if (!abstract) return;

    if (roleType === RoleType.ADMIN) {
      if (checkPermit(abstract.canAssignMemberRole, RoleType.ADMIN)) {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.NONE,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.ADMIN,
        });
      }
    }
    else if (roleType === RoleType.MEMBER) {
      if (checkPermit(abstract.canAssignMemberRole, RoleType.MEMBER)) {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.ADMIN,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.MEMBER,
        });
      }
    }
    else if (roleType === RoleType.SUBSCRIBER) {
      if (checkPermit(abstract.canAssignMemberRole, RoleType.SUBSCRIBER)) {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.MEMBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.SUBSCRIBER,
        });
      }
    }
    else if (roleType === RoleType.OTHER) {
      if (checkPermit(abstract.canAssignMemberRole, RoleType.OTHER)) {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.SUBSCRIBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canAssignMemberRole: RoleType.OTHER,
        });
      }
    }
  }

  const handleCanEditLayoutClick = (roleType: RoleType) => (e: any) => {
    e.preventDefault();
    if (!abstract) return;

    if (roleType === RoleType.ADMIN) {
      if (checkPermit(abstract.canEditLayout, RoleType.ADMIN)) {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.NONE,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.ADMIN,
        });
      }
    }
    else if (roleType === RoleType.MEMBER) {
      if (checkPermit(abstract.canEditLayout, RoleType.MEMBER)) {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.ADMIN,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.MEMBER,
        });
      }
    }
    else if (roleType === RoleType.SUBSCRIBER) {
      if (checkPermit(abstract.canEditLayout, RoleType.SUBSCRIBER)) {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.MEMBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.SUBSCRIBER,
        });
      }
    }
    else if (roleType === RoleType.OTHER) {
      if (checkPermit(abstract.canEditLayout, RoleType.OTHER)) {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.SUBSCRIBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canEditLayout: RoleType.OTHER,
        });
      }
    }
   }

  const handleCanPostClick = (roleType: RoleType) => (e: any) => {
    e.preventDefault();
    if (!abstract) return;

    if (roleType === RoleType.ADMIN) {
      if (checkPermit(abstract.canPost, RoleType.ADMIN)) {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.NONE,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.ADMIN,
        });
      }
    }
    else if (roleType === RoleType.MEMBER) {
      if (checkPermit(abstract.canPost, RoleType.MEMBER)) {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.ADMIN,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.MEMBER,
        });
      }
    }
    else if (roleType === RoleType.SUBSCRIBER) {
      if (checkPermit(abstract.canPost, RoleType.SUBSCRIBER)) {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.MEMBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.SUBSCRIBER,
        });
      }
    }
    else if (roleType === RoleType.OTHER) {
      if (checkPermit(abstract.canPost, RoleType.OTHER)) {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.SUBSCRIBER,
        });
      }
      else {
        setArrowPermissions(abstract.id, {
          canPost: RoleType.OTHER,
        });
      }
    }
  }

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
        SETTINGS
      </IonCardHeader>
      <IonCardContent>
        <div style={{
          fontWeight: 'bold',
          fontSize: 20,
        }}>
          Name
        </div>
        <IonItem>
          <IonInput 
            value={name}
            onIonChange={handleNameChange}
          />
        </IonItem>
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
          marginTop: 10,
        }}>
          Permissions
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Can assign Member role</b> 
          <IonItem style={{
          }}>
            <IonCheckbox 
              checked={checkPermit(abstract.canAssignMemberRole, RoleType.ADMIN)} 
              onClick={handleCanAssignMemberRoleClick(RoleType.ADMIN)}
            />
            <IonLabel>&nbsp;Admin</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canAssignMemberRole, RoleType.MEMBER)} 
              onClick={handleCanAssignMemberRoleClick(RoleType.MEMBER)}
            />
            <IonLabel>&nbsp;Member</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canAssignMemberRole, RoleType.SUBSCRIBER)} 
              onClick={handleCanAssignMemberRoleClick(RoleType.SUBSCRIBER)}
            />
            <IonLabel>&nbsp;Subscriber</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox
              checked={checkPermit(abstract.canAssignMemberRole, RoleType.OTHER)}
              onClick={handleCanAssignMemberRoleClick(RoleType.OTHER)}
            />
            <IonLabel>&nbsp;Other</IonLabel>
          </IonItem>
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Can edit layout</b>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canEditLayout, RoleType.ADMIN)}
              onClick={handleCanEditLayoutClick(RoleType.ADMIN)}
            />
            <IonLabel>&nbsp;Admin</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canEditLayout, RoleType.MEMBER)} 
              onClick={handleCanEditLayoutClick(RoleType.MEMBER)}
            />
            <IonLabel>&nbsp;Member</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox
              checked={checkPermit(abstract.canEditLayout, RoleType.SUBSCRIBER)}
              onClick={handleCanEditLayoutClick(RoleType.SUBSCRIBER)}
            />
            <IonLabel>&nbsp;Subscriber</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox
              checked={checkPermit(abstract.canEditLayout, RoleType.OTHER)}
              onClick={handleCanEditLayoutClick(RoleType.OTHER)}
            />
            <IonLabel>&nbsp;Other</IonLabel>
          </IonItem>
        </div>
        <div style={{
          paddingBottom: 10,
        }}>
          <b>Can post</b>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canPost, RoleType.ADMIN)}
              onClick={handleCanPostClick(RoleType.ADMIN)}
            />
            <IonLabel>&nbsp;Admin</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canPost, RoleType.MEMBER)}
              onClick={handleCanPostClick(RoleType.MEMBER)}
            />
            <IonLabel>&nbsp;Member</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox 
              checked={checkPermit(abstract.canPost, RoleType.SUBSCRIBER)}
              onClick={handleCanPostClick(RoleType.SUBSCRIBER)}
            />
            <IonLabel>&nbsp;Subscriber</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox
              checked={checkPermit(abstract.canPost, RoleType.OTHER)}
              onClick={handleCanPostClick(RoleType.OTHER)}
            />
            <IonLabel>&nbsp;Other</IonLabel>
          </IonItem>
        </div>
      </IonCardContent>
    </IonCard>
  )
}
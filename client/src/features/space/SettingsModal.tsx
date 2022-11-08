import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { MAX_Z_INDEX, SPACE_BAR_HEIGHT } from '../../constants';
import { ChromePicker } from 'react-color';
import useSetArrowColor from '../arrow/useSetArrowColor';
import { AppContext } from '../../app/App';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonContent, IonLabel, IonMenu, IonModal } from '@ionic/react';

interface SettingsMenuProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsMenu(props: SettingsMenuProps) {
  const { 
    user,
  } = useContext(AppContext);

  const {
    role,
    abstract,
  } = useContext(SpaceContext);

  const modalRef = useRef<HTMLIonModalElement>(null);

  const { setArrowColor } = useSetArrowColor();

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

  if (!abstract) return null;

  return (
    <IonModal ref={modalRef} onWillDismiss={handleClose}>
      <IonCard style={{
        padding: 10,
      }}>
        <IonCardHeader>
        Settings
        </IonCardHeader>
        <IonCardContent>
        <IonCard style={{
          margin: 10,
          padding: 10,
        }}>
          <IonCardHeader>
            Color
          </IonCardHeader>
          <IonCardContent>
            <ChromePicker 
              color={color}
              disableAlpha={true}
              onChange={handleColorChange}
              onChangeComplete={handleColorChangeComplete}
            />
          </IonCardContent>
        </IonCard>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}
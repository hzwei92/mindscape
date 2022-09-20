import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { SpaceContext } from './SpaceComponent';
import { MAX_Z_INDEX, ROLES_MENU_WIDTH, SPACE_BAR_HEIGHT } from '../../constants';
import { ChromePicker } from 'react-color';
import { Arrow } from '../arrow/arrow';
import useSetArrowColor from '../arrow/useSetArrowColor';
import { AppContext } from '../../app/App';
import { IonCard, IonLabel, IonMenu } from '@ionic/react';

interface SettingsMenuProps {
  settingsMenuRef: React.RefObject<HTMLIonMenuElement>;
}

export default function SettingsMenu(props: SettingsMenuProps) {
  const { setArrowColor } = useSetArrowColor();

  const { 
    user,
  } = useContext(AppContext);

  const {
    role,
    abstract,
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

  const [color, setColor] = useState(abstract?.color);
  const [colorTimeout, setColorTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = abstract?.userId === user?.id || role?.type === 'ADMIN';

  useEffect(() => {
    if (!abstract?.color) return;

    setColor(abstract.color);
  }, [abstract?.color])

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

  if (!abstract) return null;

  return (
    <IonMenu ref={props.settingsMenuRef} side='end' menuId='settingsMenu' contentId='content' style={{
      zIndex: MAX_Z_INDEX,
    }}>
      <IonCard style={{
        overflowY: 'scroll',
        marginTop: `${SPACE_BAR_HEIGHT}px`,
        height: `calc(100% - ${SPACE_BAR_HEIGHT}px - 20px)`,
        width: ROLES_MENU_WIDTH,
      }}>
        <IonCard style={{
          margin: 1,
          padding: 1,
        }}>
          <IonLabel>
            Color
          </IonLabel>
          <div style={{
            margin: 1,
          }}>
            <ChromePicker 
              color={color}
              disableAlpha={true}
              onChange={handleColorChange}
              onChangeComplete={handleColorChangeComplete}
            />
          </div>
        </IonCard>
      </IonCard>
    </IonMenu>
  )
}
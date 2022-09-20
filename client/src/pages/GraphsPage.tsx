import { IonButton, IonCard, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { personCircle, moon, sunny } from 'ionicons/icons';

import React, { useContext, useState } from 'react';
import { AppContext } from '../app/App';
import { useAppSelector } from '../app/store';
import { APP_BAR_HEIGHT, MAX_Z_INDEX } from '../constants';
import { selectIdToArrow } from '../features/arrow/arrowSlice';
import { selectFocusTab } from '../features/tab/tabSlice';
import useCreateTab from '../features/tab/useCreateTab';

const GraphsPage: React.FC = () => {
  const { 
    user,
  } = useContext(AppContext);
  
  const focusTab = useAppSelector(selectFocusTab);

  const roles = [...(user?.roles || [])]
    .filter(role =>!role.deleteDate);

  const tabs = [...(user?.tabs || [])]
    .filter(tab =>!tab.deleteDate)
    .sort((a, b) => a.i - b.i);

  const idToArrow = useAppSelector(selectIdToArrow);

  const [showResizer, setShowResizer] = useState(false);

  // const { requestRole } = useRequestRole();
  // const { removeRole } = useRemoveRole();

  const { createTab } = useCreateTab();

  const handleJoinClick = (jamId: string) => (event: React.MouseEvent) => {
    //requestRole(jamId);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    //removeRole(roleId)
  }


  // const handleJamClick = (jamUserId: string | null, jamRouteName: string) => (event: React.MouseEvent) => {
  //   if (!(jamUserId && jamRouteName === user?.routeName)) {
  //     const route = `${jamUserId ? 'u' : 'j'}/${jamRouteName}/0`
  //     dispatch(setFocusRouteName(route))

  //     dispatch(setSpace('FOCUS'));

  //     if (width < MOBILE_WIDTH) {
  //       dispatch(setSurveyorMode(''));
  //     }

  //     navigate(route);
  //   }
  // }

  const handleArrowClick = (arrowId: string) => () => {
    const hasTab = (user?.tabs || []).some(tab => tab.arrowId === arrowId);
    if (!hasTab) {
      createTab(arrowId, null, false, true);
    }
  }

  const handleStartClick = () => {
    // setCreateGraphArrowId(null);
    // setIsCreatingGraph(true);
  }

  const handleClose = () => {
  };

  return (
    <div style={{
      position: 'fixed',
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      marginTop: `${APP_BAR_HEIGHT}px`,
      display: 'flex',
      flexDirection: 'row',
      zIndex: MAX_Z_INDEX + 1000,
    }}>
      <IonCard style={{
        height: '100%',
        width: 'calc(100% - 4px)',
      }}>
        <div style={{
          height: '100%',
        }}>
          <IonCard style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 1,
          }}>
            <IonButton onClick={handleStartClick} style={{
              whiteSpace: 'nowrap',
            }}>
              Create a graph
            </IonButton>
          </IonCard>
          <div style={{
            height: '100%',
            width: '100%',
            overflowY: 'scroll',
          }}>
          {
              tabs.map(tab => {
                const { arrow } = tab;
                return (
                  <IonCard key={`tab-${tab.id}`} style={{
                    margin: 1,
                    padding: 1,
                    fontSize: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div>
                        {tab.i + 1}
                      </div>
                      <div>
                        <IonLabel color={arrow.color} onClick={handleArrowClick(arrow.id)} style={{
                          color: arrow.color,
                          cursor: arrow.userId === user?.id
                            ? 'default'
                            : 'pointer',
                        }}>
                          {arrow.title}
                        </IonLabel>
                        &nbsp;
                      </div>
                    </div>
                  </IonCard>
                )
              })
            }
            {
              roles.filter(role => !tabs.some(tab => tab.arrowId === role.arrowId)).map(role => {
                const { arrow } = role;
                return (
                  <IonCard key={`role-${role.id}`} style={{
                    margin: 1,
                    padding: 1,
                    fontSize: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div>
                        <IonLabel color={arrow.color} onClick={handleArrowClick(arrow.id)} style={{
                          color: arrow.color,
                          cursor: arrow.userId === user?.id
                            ? 'default'
                            : 'pointer',
                        }}>
                          {arrow.title}
                        </IonLabel>
                      </div>
                    </div>
                  </IonCard>
                );
              })
            }
          </div>
        </div>
      </IonCard>
    </div>
  );
}

export default GraphsPage;

import { IonButton, IonButtons, IonCard, IonLabel, IonPage } from '@ionic/react';
import React, { useContext, useState } from 'react';
import { AppContext } from '../app/App';
import { useAppSelector } from '../app/store';
import { APP_BAR_HEIGHT, MAX_Z_INDEX } from '../constants';
import { selectIdToArrow } from '../features/arrow/arrowSlice';
import { Tab } from '../features/tab/tab';
import { selectFocusTab } from '../features/tab/tabSlice';
import useCreateTab from '../features/tab/useCreateTab';
import { useHistory } from 'react-router';

const GraphsPage: React.FC = () => {
  const history = useHistory();

  const { 
    palette,
    user,
    setIsCreatingGraph,
    setCreateGraphArrowId,
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
    let arrowTab = null as Tab | null;
    (user?.tabs || []).some(tab => {
      if (tab.arrowId === arrowId) {
        arrowTab = tab;
      }
      return !!arrowTab;
    });
    if (arrowTab) {
      history.push(`/g/${arrowTab?.arrow.routeName}/0`);
    }
    else {
      createTab(arrowId, null, false, true);
    }
  }

  const handleStartClick = () => {
    setCreateGraphArrowId(null);
    setIsCreatingGraph(true);
  }

  const handleClose = () => {
  };

  return (
    <IonPage>
      <IonCard style={{
        backgroundColor: palette === 'dark'
          ? '#000000'
          : '#e0e0e0',
        height: 'calc(100% - 56px)',
        top: 56,
        margin: 0,
        paddingTop: 10,
        borderRadius: 0,
      }}>
        <div style={{
          height: '100%',
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            overflowY: 'scroll',
          }}>
            <IonButton onClick={handleStartClick} style={{
              whiteSpace: 'nowrap',
              marginLeft: 10,
            }}>
              CREATE A GRAPH
            </IonButton>
          {
              tabs.map(tab => {
                const { arrow } = tab;
                return (
                  <IonCard key={`tab-${tab.id}`} style={{
                    margin: 10,
                    padding: 10,
                    fontSize: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div>
                        {tab.i + 1}&nbsp;&nbsp;
                        <IonLabel color={arrow.color} onClick={handleArrowClick(arrow.id)} style={{
                          color: arrow.color,
                          cursor: 'pointer',
                        }}>
                          {arrow.title || '...'}
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
                    margin: 10,
                    padding: 10,
                    fontSize: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <IonLabel color={arrow.color} onClick={handleArrowClick(arrow.id)} style={{
                      color: arrow.color,
                      cursor: 'pointer',
                    }}>
                      {arrow.title || '...'}
                    </IonLabel>
                  </IonCard>
                );
              })
            }
          </div>
        </div>
      </IonCard>
    </IonPage>
  );
}

export default GraphsPage;

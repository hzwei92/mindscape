import { addInstance, removeInstance, selectArrowById, selectInstanceById } from './arrowSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { getTimeString } from '../../utils';
import { selectUserById } from '../user/userSlice';
import { IonIcon, IonLabel, useIonRouter } from '@ionic/react';
import ArrowEditor from './ArrowEditor';
import ArrowVoter from './ArrowVoter';
import { reloadOutline, returnDownForwardOutline, returnUpBack } from 'ionicons/icons';
import UserTag from '../user/UserTag';

interface ArrowProps {
  arrowId: string;
  showLinkLeftIcon: boolean;
  showLinkRightIcon: boolean;
  showPostIcon: boolean;
  instanceId: string;
  isWindow: boolean;
  isGroup: boolean;
  isTab: boolean;
  fontSize: number;
}

export default function ArrowComponent(props: ArrowProps) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const arrow = useAppSelector(state => selectArrowById(state, props.arrowId));
  const arrowUser = useAppSelector(state => selectUserById(state, arrow?.userId));

  useAppSelector(state => selectInstanceById(state, props.instanceId)); // rerender on instance change

  useEffect(() => {
    dispatch(addInstance({
      id: props.instanceId,
      arrowId: props.arrowId,
      isNewlySaved: false,
      shouldRefreshDraft: false,
    }));
    return () => {
      dispatch(removeInstance(props.instanceId));
    };
  }, []);

  if (!arrow) return null;

  const handleTitleClick = () => {
    router.push(`/g/${arrow.routeName}/0`)
  }

  const time = new Date(arrow.removeDate || arrow.commitDate || arrow.saveDate || Date.now()).getTime();
  const timeString = getTimeString(time);

  return (
    <div style={{
      paddingLeft: 30,
    }}>
    <div style={{
      margin:1,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        left: -35,
        top: -20,
      }}>
        <ArrowVoter arrow={arrow} />
      </div>
      <div style={{
        fontSize: 14,
        paddingBottom: '4px',
        display: 'flex',
        flexDirection: 'row',
      }}>
        <span style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
            {
              props.showLinkRightIcon
                ? <IonIcon icon={returnDownForwardOutline} style={{
                    paddingRight: 1,
                  }}/>
                : props.showLinkLeftIcon
                  ? <IonIcon icon={returnUpBack} style={{
                      paddingRight: 1,
                    }}/>
                  : props.showPostIcon
                    ? <IonIcon icon={reloadOutline} style={{
                        paddingRight: 1,
                      }}/>
                    : null
            }
        </span>
        <UserTag user={arrowUser} />
        &nbsp;
        { ' ' }
        { timeString }
        {
          arrow.removeDate
            ? ' (deleted)'
            : arrow.commitDate 
              ? ' (committed)'
              : null
        }
        {
          // arrow.ownerArrow.id === props.abstract?.id
          //   ? null
          //   : <div style={{
          //       marginTop: 1,
          //     }}>
          //       &nbsp;&nbsp;
          //       <Link color={arrow.ownerArrow.color} onMouseDown={handleMouseDown} onClick={handleJamClick}
          //         style={{
          //           color: arrow.ownerArrow.color,
          //           cursor: 'pointer'
          //         }}
          //       >
          //         {`m/${arrow.ownerArrow.routeName}`}
          //       </Link>
          //     </div>
        }
      </div>
      <div>
        {
          arrow.title 
            ? <div style={{
                paddingTop: '5px',
              }}>
                <IonLabel onClick={handleTitleClick} style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontSize: 40,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}>
                  {
                    arrow.faviconUrl
                      ? <img src={arrow.faviconUrl} style={{
                          display: 'inline-block',
                          width: 20,
                          height: 20,
                          marginRight: 1,
                        }}/> 
                      : null
                  }
                  {arrow.title}
                </IonLabel>
              </div>
            : null
        }
        <ArrowEditor
          arrow={arrow}
          isReadonly={false}
          instanceId={props.instanceId}
          fontSize={props.fontSize}
        />
      </div>
    </div>
    </div>
  )

}
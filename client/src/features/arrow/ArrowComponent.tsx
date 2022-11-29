import { addInstance, removeInstance, selectArrowById, selectInstanceById } from './arrowSlice';
import { useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { getTimeString } from '../../utils';
import { selectUserById } from '../user/userSlice';
import { IonIcon, IonLabel, useIonRouter } from '@ionic/react';
import ArrowEditor from './ArrowEditor';
import ArrowVoter from './ArrowVoter';
import { reloadOutline, returnDownForwardOutline, returnUpBack } from 'ionicons/icons';
import UserTag from '../user/UserTag';
import { SpaceContext } from '../space/SpaceComponent';

interface ArrowProps {
  arrowId: string;
  showLinkLeftIcon: boolean;
  showLinkRightIcon: boolean;
  showPostIcon: boolean;
  instanceId: string;
  fontSize: number;
  tagFontSize: number;
}

export default function ArrowComponent(props: ArrowProps) {
  const dispatch = useAppDispatch();

  const { abstract } = useContext(SpaceContext);

  const router = useIonRouter();

  const arrow = useAppSelector(state => selectArrowById(state, props.arrowId));
  const arrowUser = useAppSelector(state => selectUserById(state, arrow?.userId));
  const arrowAbstract = useAppSelector(state => selectArrowById(state, arrow?.abstractId));

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

  const handleAbstractClick = () => {
    router.push(`/g/${arrowAbstract?.routeName}/0`)
  }

  const time = new Date(arrow.removeDate || arrow.commitDate || arrow.saveDate || Date.now()).getTime();
  const timeString = getTimeString(time);
  const isEntry = props.showPostIcon || props.showLinkLeftIcon || props.showLinkRightIcon
  return (
    <div style={{
      position: 'relative',
      paddingLeft: 14,
    }}>
      <div style={{
        position: 'absolute',
        left: -10,
        top: -5,
      }}>
        <ArrowVoter arrow={arrow} />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontSize: props.tagFontSize,
      }}>
        <span style={{
          display: isEntry
            ? 'flex'
            : 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: 5,
        }}>
            {
              props.showLinkRightIcon
                ? <IonIcon icon={returnDownForwardOutline} />
                : props.showLinkLeftIcon
                  ? <IonIcon icon={returnUpBack} />
                  : props.showPostIcon
                    ? <IonIcon icon={reloadOutline} />
                    : null
            }
        </span>
        <span style={{
          paddingRight: 5,
        }}>
          <UserTag user={arrowUser} fontSize={props.tagFontSize}/>
        </span>
        <span style={{
          paddingRight: 5,
          fontSize: props.tagFontSize,
        }}>
          { timeString }
        </span>
        {
          arrow.removeDate
            ? <span style={{
                paddingRight: 5,
              }}>
                (deleted)
              </span>
            : arrow.commitDate 
              ? <span style={{
                  paddingRight: 5,
                }}>
                  (committed)
                </span>
              : null
        }
        {
          arrowAbstract?.id === abstract?.id
            ? null
            : <span onClick={handleAbstractClick} style={{
                color: arrowAbstract?.color,
                cursor: 'pointer'
              }}>
                {arrowAbstract?.title}
              </span>
        }
      </div>
      <div>
        {
          arrow.title 
            ? <div onClick={handleTitleClick} style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
                color: arrow.color,
                paddingTop: 5,
                textDecoration: 'underline',
              }}>
                {arrow.title}
              </div>
            : null
        }
        <div style={{
          height: 5,
        }}/>
        <ArrowEditor
          arrow={arrow}
          isReadonly={false}
          instanceId={props.instanceId}
          fontSize={props.fontSize}
        />
      </div>
    </div>
  )

}
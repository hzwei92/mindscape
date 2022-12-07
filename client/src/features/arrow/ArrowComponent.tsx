import { addInstance, removeInstance, selectArrowById, selectInstanceById } from './arrowSlice';
import React, { useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { getTimeString } from '../../utils';
import { selectUserById } from '../user/userSlice';
import { IonIcon, isPlatform, useIonRouter } from '@ionic/react';
import ArrowEditor from './ArrowEditor';
import ArrowVoter from './ArrowVoter';
import { reloadOutline, returnDownForwardOutline, returnUpBack } from 'ionicons/icons';
import UserTag from '../user/UserTag';
import { SpaceContext } from '../space/SpaceComponent';
import { AppContext } from '../../app/App';
import { MenuMode } from '../menu/menu';

interface ArrowProps {
  arrowId: string;
  showLinkLeftIcon?: boolean;
  showLinkRightIcon?: boolean;
  showPostIcon?: boolean;
  instanceId: string;
  fontSize: number;
  tagFontSize: 10 | 14;
}

export default function ArrowComponent(props: ArrowProps) {
  const dispatch = useAppDispatch();

  const { setMenuMode } = useContext(AppContext);
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

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlatform('mobile')) {
      setMenuMode(MenuMode.NONE);
    }
    router.push(`/g/${arrow.routeName}/0`)
  }

  const handleAbstractClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlatform('mobile')) {
      setMenuMode(MenuMode.NONE);
    }
    router.push(`/g/${arrowAbstract?.routeName}/${arrow.abstractI ?? 0}`)
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: 5,
        }}>
            {
             props.showLinkLeftIcon
              ? <IonIcon icon={returnUpBack} />
              : props.showLinkRightIcon || arrow.sourceId !== arrow.targetId
                ? <IonIcon icon={returnDownForwardOutline} />
                : null
            }
        </span>
        <span style={{
          paddingRight: 2,
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
                cursor: 'pointer',
                textDecoration: 'underline',
              }}>
                {arrowAbstract?.title}
              </span>
        }
      </div>
      <div>
        {
          arrow.title 
            ? <div style={{
                paddingTop: 5,
              }}>
                <span onClick={handleTitleClick} style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontSize: 20,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: arrow.color,
                  textDecoration: 'underline',
                }}>
                  {arrow.title}
                </span>
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
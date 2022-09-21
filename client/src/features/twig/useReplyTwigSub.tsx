import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../../cache';
import { useAppDispatch } from '../../app/store';
import { useContext } from 'react';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SpaceContext } from '../space/SpaceComponent';
import { mergeTwigs } from './twigSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { AppContext } from '../../app/App';
import { mergeIdToPos } from '../space/spaceSlice';
import { SpaceType } from '../space/space';
import { useIonToast } from '@ionic/react';

const REPLY_TWIG = gql`
  subscription ReplyTwig($sessionId: String!, $abstractId: String!) {
    replyTwig(sessionId: $sessionId, abstractId: $abstractId) {
      abstract {
        id
        twigZ
        twigN
        updateDate
      }
      source {
        id
        outCount
      }
      link {
        ...FullTwigFields
      }
      target {
        ...FullTwigFields
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

export default function useReplyTwigSub() {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const {
    user,
    palette,
  } = useContext(AppContext);

  const {
    space,
    abstract,
  } = useContext(SpaceContext);

  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(REPLY_TWIG, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId: abstract?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {replyTwig}}}) => {
      console.log(replyTwig);

      const {
        abstract, 
        source,
        link,
        target,
        role,
      } = replyTwig;

      dispatch(mergeTwigs({
        space,
        twigs: [link, target]
      }));

      dispatch(mergeArrows([abstract, source]));

      dispatch(mergeIdToPos({
        space: SpaceType.FOCUS,
        idToPos: {
          [target.id]: {
            x: target.x,
            y: target.y,
          }
        },
      }))
    }
  });
}
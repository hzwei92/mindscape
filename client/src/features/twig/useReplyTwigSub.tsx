import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
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
import { Arrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';

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

export default function useReplyTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(REPLY_TWIG, {
    variables: {
      sessionId,
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

      dispatch(mergeIdToPos({
        space,
        idToPos: [link, target].reduce((acc, twig) => {
          acc[twig.id] = {
            x: twig.x,
            y: twig.y,
          };
          return acc;
        }, {})
      }))

      dispatch(mergeArrows([abstract, source]));
    }
  });
}
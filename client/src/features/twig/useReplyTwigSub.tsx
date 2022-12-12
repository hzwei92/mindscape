import { gql, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from '../space/spaceSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeIdToPos } from '../space/spaceSlice';
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

export default function useReplyTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(REPLY_TWIG, {
    variables: {
      sessionId,
      abstractId,
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

      if (!abstract) return;

      present(`New! ${target.i}.`, 1000);

      dispatch(mergeTwigs({
        abstractId: abstract.id,
        twigs: [link, target]
      }));

      dispatch(mergeIdToPos({
        abstractId: abstract.id,
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
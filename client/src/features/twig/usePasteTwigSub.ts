import { gql, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from '../space/spaceSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeIdToPos } from '../space/spaceSlice';
import { useIonToast } from '@ionic/react';
import { selectSessionId } from '../auth/authSlice';

const PASTE_TWIG = gql`
  subscription PasteTwig($sessionId: String!, $abstractId: String!) {
    pasteTwig(sessionId: $sessionId, abstractId: $abstractId) {
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

export default function usePasteTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);
  
  useSubscription(PASTE_TWIG, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {pasteTwig}}}) => {
      console.log(pasteTwig);

      const {
        abstract, 
        source,
        link,
        target,
        role,
      } = pasteTwig;

      present(`${target.i}`, 500);

      dispatch(mergeTwigs({
        abstractId,
        twigs: [link, target]
      }));

      dispatch(mergeIdToPos({
        abstractId,
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
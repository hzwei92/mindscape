import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../../cache';
import { useAppDispatch } from '../../app/store';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from './twigSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeIdToPos } from '../space/spaceSlice';
import { SpaceType } from '../space/space';
import { useIonToast } from '@ionic/react';
import { Arrow } from '../arrow/arrow';

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

export default function usePasteTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(PASTE_TWIG, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId: abstract?.id,
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
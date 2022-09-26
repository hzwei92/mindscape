import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../../cache';
import { useAppDispatch } from '../../app/store';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from './twigSlice';
import { SpaceType } from '../space/space';
import { useIonToast } from '@ionic/react';
import { Arrow } from '../arrow/arrow';

const REMOVE_TWIG = gql`
  subscription RemoveTwig($sessionId: String!, $abstractId: String!) {
    removeTwig(sessionId: $sessionId, abstractId: $abstractId) {
      twigs {
        id
        deleteDate
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useRemoveTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(REMOVE_TWIG, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId: abstract?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {removeTwig}}}) => {
      console.log(removeTwig);

      const {
        twigs,
        role,
      } = removeTwig;

      dispatch(mergeTwigs({
        space,
        twigs,
      }));
    }
  });
}
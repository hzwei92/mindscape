import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from '../space/spaceSlice';
import { useIonToast } from '@ionic/react';
import { Arrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';

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

export default function useRemoveTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(REMOVE_TWIG, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {removeTwig}}}) => {
      console.log(removeTwig);

      const {
        twigs,
        role,
      } = removeTwig;

      dispatch(mergeTwigs({
        abstractId,
        twigs,
      }));
    }
  });
}
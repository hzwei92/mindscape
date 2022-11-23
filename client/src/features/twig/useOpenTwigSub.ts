import { gql, useSubscription } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { mergeTwigs } from '../space/spaceSlice';

const OPEN_TWIG_SUB = gql`
  subscription OpenTwig($sessionId: String!, $abstractId: String!) {
    openTwig(sessionId: $sessionId, abstractId: $abstractId) {
      id
      isOpen
    }
  }
`;

export default function useOpenTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(OPEN_TWIG_SUB, {
    variables: {
      sessionId,
      abstractId,
    },
    onSubscriptionData: ({subscriptionData: {data: {openTwig}}}) => {
      console.log(openTwig);

      dispatch(mergeTwigs({
        abstractId,
        twigs: [openTwig],
      }))
    }
  });
}
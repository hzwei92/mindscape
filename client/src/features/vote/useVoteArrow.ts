import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { mergeArrows } from '../arrow/arrowSlice';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';
import { mergeUsers } from '../user/userSlice';
import { VOTE_FIELDS } from './voteFragments';
import { mergeVotes } from './voteSlice';

const VOTE_POSTS = gql`
  mutation VoteArrow($accessToken: String!, $sessionId: String!, $arrowId: String!, $weight: Int!) {
    voteArrow(accessToken: $accessToken, sessionId: $sessionId, arrowId: $arrowId, weight: $weight) {
      user {
        id
        balance
      }
      arrow {
        id
        weight
      }
      votes {
        ...VoteFields
      }
    }
  }
  ${VOTE_FIELDS}
`;

export default function useVoteArrow(onCompleted: any) {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);

  const [vote] = useMutation(VOTE_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      const {
        user,
        arrow,
        votes,
      } = data.voteArrow;

      dispatch(mergeUsers([user]));

      dispatch(mergeArrows([arrow]));

      dispatch(mergeVotes(votes));

      onCompleted();
    }
  });

  const voteArrow = (arrowId: string, weight: number) => {
    vote({
      variables: {
        accessToken,
        sessionId,
        arrowId,
        weight,
      },
    });
  };

  return { voteArrow };
}
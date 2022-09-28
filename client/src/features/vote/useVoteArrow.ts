import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { sessionVar } from '../../cache';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeUsers } from '../user/userSlice';
import { VOTE_FIELDS } from './voteFragments';
import { mergeVotes } from './voteSlice';

const VOTE_POSTS = gql`
  mutation VoteArrow($sessionId: String!, $arrowId: String!, $weight: Int!) {
    voteArrow(sessionId: $sessionId, arrowId: $arrowId, weight: $weight) {
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

  const sessionDetail = useReactiveVar(sessionVar);

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
        sessionId: sessionDetail.id,
        arrowId,
        weight,
      },
    });
  };

  return { voteArrow };
}
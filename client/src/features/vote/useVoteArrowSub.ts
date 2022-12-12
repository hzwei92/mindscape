import { gql, useSubscription } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { mergeArrows, selectArrowIdToInstanceIds } from "../arrow/arrowSlice";
import { selectSessionId } from "../auth/authSlice";
import { VOTE_FIELDS } from "./voteFragments";
import { mergeVotes } from "./voteSlice";


const VOTE_ARROW = gql`
  subscription VoteArrow($sessionId: String!, $arrowIds: [String!]!) {
    voteArrow(sessionId: $sessionId, arrowIds: $arrowIds) {
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

export default function useVoteArrowSub() {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);
  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);

  useSubscription(VOTE_ARROW, {
    variables: {
      sessionId,
      arrowIds: Object.keys(arrowIdToInstanceIds),
    },
    onSubscriptionData: ({ subscriptionData: {data: {voteArrow}}}) => {
      console.log(voteArrow);
      
      const { arrow, votes } = voteArrow;
    
      dispatch(mergeArrows([arrow]));

      dispatch(mergeVotes(votes));
    },
  })
}
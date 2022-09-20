import { gql } from '@apollo/client';

export const VOTE_FIELDS = gql`
  fragment VoteFields on Vote {
    id
    userId
    arrowId
    clicks
    tokens
    weight
    createDate
    deleteDate
  }
`;
import { gql } from '@apollo/client';

export const LEAD_FIELDS = gql`
  fragment LeadFields on Lead {
    id
    leaderId
    followerId
    deleteDate
  }
`;
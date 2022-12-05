import { gql } from '@apollo/client';
import { LEAD_FIELDS } from '../lead/leadFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SHEAF_FIELDS } from '../sheaf/sheafFragments';
import { VOTE_FIELDS } from '../vote/voteFragments';

export const ARROW_FIELDS = gql`
  fragment ArrowFields on Arrow {
    id
    routeName
    draft
    text
    title
    url
    color
    userId
    inCount
    outCount
    abstractId
    sourceId
    targetId
    sheafId
    twigN
    twigZ
    rootTwigId
    canAssignMemberRole
    canEditLayout
    canPost
    canTalk
    canHear
    canView
    lng
    lat
    city
    state
    country
    weight
    isOpaque
    saveDate
    commitDate
    removeDate
    createDate
    updateDate
    deleteDate
  }
`;

export const FULL_ARROW_FIELDS = gql`
  fragment FullArrowFields on Arrow {
    ...ArrowFields
    votes {
      ...VoteFields
    }
    sheaf {
      ...SheafFields
    }
    abstract {
      id
      title
      color
    }
    user {
      id
      name
      color
      email
      activeDate
      verifyEmailDate
      currentUserLead {
        ...LeadFields
      }
    }
    currentUserRole {
      ...FullRoleFields
    }
  }
  ${ARROW_FIELDS}
  ${SHEAF_FIELDS}
  ${VOTE_FIELDS}
  ${FULL_ROLE_FIELDS}
  ${LEAD_FIELDS}
`;


export const ABSTRACT_ARROW_FIELDS = gql`
  fragment AbstractArrowFields on Arrow {
    ...FullArrowFields
    roles {
      ...FullRoleFields
    }
  }
  ${FULL_ARROW_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

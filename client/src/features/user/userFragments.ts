import { gql } from '@apollo/client';
import { LEAD_FIELDS } from '../lead/leadFragments';
import { FULL_TAB_FIELDS } from '../tab/tabFragments';

export const MINI_USER_FIELDS = gql`
  fragment MiniUserFields on User {
    id
    name
    color
    email
    verifyEmailDate
    activeDate
    currentUserLead {
      ...LeadFields
    }
  }
  ${LEAD_FIELDS}
`;

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    lowercaseName
    routeName
    email
    color
    palette
    balance
    replyN
    mapLng
    mapLat
    mapZoom
    activeDate
    verifyEmailDate
    checkAlertsDate
    createGraphDate
    navigateGraphDate
    togglePaletteDate
    deleteDate
    currentUserLead {
      ...LeadFields
    }
  }
  ${LEAD_FIELDS}
`;


export const FULL_USER_FIELDS = gql`
  fragment FullUserFields on User {
    ...UserFields
    tabs {
      ...FullTabFields
    }
  }
  ${USER_FIELDS}
  ${FULL_TAB_FIELDS}
`;
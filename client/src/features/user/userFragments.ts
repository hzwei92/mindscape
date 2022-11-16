import { gql } from '@apollo/client';
import { LEAD_FIELDS } from '../lead/leadFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { FULL_TAB_FIELDS } from '../tab/tabFragments';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    lowercaseName
    routeName
    email
    color
    palette
    verifyEmailDate
    balance
    mapLng
    mapLat
    mapZoom
    activeDate
    deleteDate
  }
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
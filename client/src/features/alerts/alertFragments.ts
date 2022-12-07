import { gql } from "@apollo/client";
import { ARROW_FIELDS } from "../arrow/arrowFragments";
import { LEAD_FIELDS } from "../lead/leadFragments";
import { ROLE_FIELDS } from "../role/roleFragments";


export const ALERT_FIELDS = gql`
  fragment AlertFields on Alert {
    id
    userId
    sourceId
    linkId
    targetId
    leadId
    roleId
    abstractRoleId
    reason
    createDate
    deleteDate
  }
`;


export const FULL_ALERT_FIELDS = gql`
  fragment FullAlertFields on Alert {
    ...AlertFields
    source {
      ...ArrowFields
      user {
        id
        name
        email
        color
        verifyEmailDate
        activeDate
      }
      abstract {
        id
        title
        color
        routeName
      }
    }
    link {
      ...ArrowFields
      user {
        id
        name
        email
        color
        verifyEmailDate
        activeDate
      }
      abstract {
        id
        title
        color
        routeName
      }
    }
    target {
      ...ArrowFields
      user {
        id
        name
        email
        color
        verifyEmailDate
        activeDate
      }
      abstract {
        id
        title
        color
        routeName
      }
    }
    lead {
      ...LeadFields
    }
    role {
      ...RoleFields
    }
    abstractRole {
      ...RoleFields
    }
  }
  ${ALERT_FIELDS}
  ${ARROW_FIELDS}
  ${LEAD_FIELDS}
  ${ROLE_FIELDS}
`;
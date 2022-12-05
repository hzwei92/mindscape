import { gql } from '@apollo/client';

export const ROLE_FIELDS = gql`
  fragment RoleFields on Role {
    id
    userId
    arrowId
    type
    isInvited
    isRequested
    deleteDate
  }
`;

export const FULL_ROLE_FIELDS = gql`
  fragment FullRoleFields on Role {
    ...RoleFields
    user {
      id
      name
      color
      email
      activeDate
    }
    arrow {
      id
      title
      routeName
      updateDate
      user {
        id
        name
        color
      }
    }
  }
  ${ROLE_FIELDS}
`;
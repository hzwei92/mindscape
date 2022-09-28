import { gql } from "@apollo/client";

export const SHEAF_FIELDS = gql`
  fragment SheafFields on Sheaf {
    id
    routeName
    url
    sourceId
    targetId
    inCount
    outCount
    weight
    createDate
    updateDate
    deleteDate
  }
`;
import { gql } from "@apollo/client";
import { FULL_ARROW_FIELDS } from "../arrow/arrowFragments";


export const TAB_FIELDS = gql`
  fragment TabFields on Tab {
    id
    userId
    arrowId
    i
    isFrame
    isFocus
    deleteDate
  }
`;

export const FULL_TAB_FIELDS = gql`
  fragment FullTabFields on Tab {
    ...TabFields
    arrow {
      ...FullArrowFields
    }
  }
  ${TAB_FIELDS}
  ${FULL_ARROW_FIELDS}
`;
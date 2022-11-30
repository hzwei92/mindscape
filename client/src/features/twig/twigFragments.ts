import { gql } from '@apollo/client';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';

export const TWIG_FIELDS = gql`
  fragment TwigFields on Twig {
    id
    sourceId
    targetId
    userId
    abstractId
    detailId
    i
    x
    y
    z
    isRoot
    isOpen
    createDate
    updateDate
    deleteDate
  }
`;

export const FULL_TWIG_FIELDS = gql`
  fragment FullTwigFields on Twig {
    ...TwigFields
    user {
      id
      name
      email
      verifyEmailDate
      color
    }
    detail {
      ...FullArrowFields
    }
    parent {
      id
    }
    children {
      id
    }
  }
  ${TWIG_FIELDS}
  ${FULL_ARROW_FIELDS}
`;
import { gql, useMutation } from '@apollo/client';
import { useAppSelector } from '../../app/store';
import { FULL_ARROW_FIELDS } from './arrowFragments';

const GET_ARROWS = gql`
  mutation GetArrows($arrowIds: [String!]!) {
    getArrows(arrowIds: $arrowIds) {
      ...FullArrowFields
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useGetArrows(onCompleted?: any) {
  const [get] = useMutation(GET_ARROWS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      onCompleted && onCompleted(data.getArrows);
    },
  });
  
  const getArrows = (arrowIds: string[]) => {
    get({
      variables: {
        arrowIds,
      }
    });
  };
  return { getArrows };
}
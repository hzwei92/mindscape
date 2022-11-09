import { gql, useMutation } from '@apollo/client';
import { useAppSelector } from '../../app/store';
import { selectAccessToken } from '../auth/authSlice';
import { FULL_ARROW_FIELDS } from './arrowFragments';

const GET_ARROWS = gql`
  mutation GetArrows($accessToken: String!, $arrowIds: [String!]!) {
    getArrows(accessToken: $accessToken, arrowIds: $arrowIds) {
      ...FullArrowFields
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useGetArrows(onCompleted?: any) {
  const accessToken = useAppSelector(selectAccessToken);

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
        accessToken,
        arrowIds,
      }
    });
  };
  return { getArrows };
}
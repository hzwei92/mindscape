import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { Arrow } from './arrow';
import { FULL_ARROW_FIELDS } from './arrowFragments';
import { mergeArrows, selectArrowIdToInstanceIds, selectIdToInstance, updateInstance } from './arrowSlice';

const GET_ARROWS = gql`
  mutation GetArrows($arrowIds: [String!]!) {
    getArrows(arrowIds: $arrowIds) {
      ...FullArrowFields
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useGetArrows(onCompleted?: any) {
  const dispatch = useAppDispatch();

  const idToInstance = useAppSelector(selectIdToInstance);
  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);

  const [get] = useMutation(GET_ARROWS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeArrows(data.getArrows));

      data.getArrows.forEach((arrow: Arrow) => {
        const instanceIds = arrowIdToInstanceIds[arrow.id];

        instanceIds.forEach(id => {
          dispatch(updateInstance({
            ...idToInstance[id],
            shouldRefreshDraft: true,
          }))
        });
      });

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
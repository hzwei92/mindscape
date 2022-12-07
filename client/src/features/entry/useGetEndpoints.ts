import { gql, useMutation } from '@apollo/client';
import { arrowUndo } from 'ionicons/icons';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { Arrow } from '../arrow/arrow';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { mergeArrows, selectArrowById } from '../arrow/arrowSlice';
import { Entry } from './entry';
import { mergeEntries, selectIdToEntry, updateEntry } from './entrySlice';

const GET_ARROWS = gql`
  mutation GetArrows($arrowIds: [String!]!) {
    getArrows(arrowIds: $arrowIds) {
      ...FullArrowFields
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useGetEndpoints(entryId: string, arrowId: string) {
  const dispatch = useAppDispatch();

  const arrow = useAppSelector(state => selectArrowById(state, arrowId));
  const idToEntry = useAppSelector(selectIdToEntry)

  const [get] = useMutation(GET_ARROWS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeArrows(data.getArrows));

      const idToEntry1: IdToType<Entry> = {};

      let sourceEntry = null as Entry | null;
      let targetEntry = null as Entry | null;
      data.getArrows.forEach((a: Arrow) => {
        if (a.id === arrow?.sourceId) {
          sourceEntry = {
            id: v4(),
            userId: a.userId,
            parentId: entryId,
            arrowId: a.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: null,
            targetId: null,
          };
          idToEntry1[sourceEntry.id] = sourceEntry;
        }
        else if (a.id === arrow?.targetId) {
          targetEntry ={
            id: v4(),
            userId: a.userId,
            parentId: entryId,
            arrowId: a.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: null,
            targetId: null,
          };
          idToEntry1[targetEntry.id] = targetEntry;
        }
      })
      if (sourceEntry && targetEntry) {
        const entry = idToEntry[entryId];
        dispatch(updateEntry({
          ...entry,
          sourceId: sourceEntry.id,
          targetId: targetEntry.id,
        }))

        dispatch(mergeEntries(idToEntry1));
      }
    },
  });
  
  const getEndpoints = () => {
    if (!arrow || arrow.sourceId === arrow.targetId) return;

    get({
      variables: {
        arrowIds: [
          arrow.sourceId,
          arrow.targetId,
        ],
      }
    });
  };
  return { getEndpoints };
}
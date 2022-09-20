import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { Entry } from '../entry/entry';
import { mergeEntries, selectIdToEntry } from '../entry/entrySlice';
import { VOTE_FIELDS } from '../vote/voteFragments';
import { Arrow } from './arrow';
import { FULL_ARROW_FIELDS } from './arrowFragments';

const GET_INS = gql`
  mutation GetIns($arrowId: String!, $offset: Int!) {
    getIns(arrowId: $arrowId, offset: $offset) {
      ...FullArrowFields
      source {
        id
        outCount
      }
      target {
        ...FullArrowFields
      }
      votes {
        ...VoteFields
      }
    }
  }
  ${FULL_ARROW_FIELDS}
  ${VOTE_FIELDS}
`;

export default function useGetIns(entryId: string, arrowId: string) {
  const idToEntry = useAppSelector(selectIdToEntry);
  const dispatch = useAppDispatch();
  const [getInArrows] = useMutation(GET_INS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      const arrows: Arrow[] = [];

      const idToEntry1: IdToType<Entry> = {};

      data.getIns.forEach((link: Arrow) => {
        if (!link.source) return;

        arrows.push(link);
        arrows.push(link.source);

        let existingEntry = null as Entry | null;

        idToEntry[entryId].inIds.some(id => {
          if (idToEntry[id].arrowId === link.id) {
            existingEntry = idToEntry[id];
          }
          return !!existingEntry;
        });

        if (!existingEntry) {
          const linkEntryId = v4();
          const sourceEntryId = v4();

          const linkEntry: Entry = {
            id: linkEntryId,
            userId: link.userId,
            parentId: entryId,
            arrowId: link.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: sourceEntryId,
            targetId: entryId,
            shouldGetLinks: false,
          };
          idToEntry1[linkEntry.id] = linkEntry;

          const sourceEntry: Entry = {
            id: sourceEntryId,
            userId: link.source.userId,
            parentId: linkEntryId,
            arrowId: link.source.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: null,
            targetId: null,
            shouldGetLinks: false,
          };
          idToEntry1[sourceEntry.id] = sourceEntry;


          if (idToEntry1[entryId]) {
            idToEntry1[entryId].inIds = [...idToEntry1[entryId].inIds, linkEntry.id];
          }
          else {
            idToEntry1[entryId] = {
              ...idToEntry[entryId],
              inIds: [...idToEntry[entryId].inIds, linkEntry.id],
              showIns: true,
              showOuts: false,
              shouldGetLinks: false,
            }
          }
        }
      });

      dispatch(mergeEntries(idToEntry1));
    },
    fetchPolicy: 'network-only',
  });

  const getIns = (offset: number) => {
    getInArrows({
      variables: {
        arrowId,
        offset,
      }
    });
  }
  return { getIns }
}
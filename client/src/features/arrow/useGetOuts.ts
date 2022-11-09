import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { selectAccessToken } from '../auth/authSlice';
import { Entry } from '../entry/entry';
import { mergeEntries, selectIdToEntry } from '../entry/entrySlice';
import { VOTE_FIELDS } from '../vote/voteFragments';
import { Arrow } from './arrow';
import { FULL_ARROW_FIELDS } from './arrowFragments';
import { mergeArrows } from './arrowSlice';

const GET_OUTS = gql`
  mutation GetOuts($accessToken: String!, $arrowId: String!, $offset: Int!) {
    getOuts(accessToken: $accessToken, arrowId: $arrowId, offset: $offset) {
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

export default function useGetOuts(entryId: string, arrowId: string) {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
  const idToEntry = useAppSelector(selectIdToEntry);

  const [getOutArrows] = useMutation(GET_OUTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      const arrows: Arrow[] = [];

      const idToEntry1: IdToType<Entry> = {};

      data.getOuts.forEach((link: Arrow) => {
        if (!link.target) return;

        arrows.push(link);
        arrows.push(link.target);

        let existingEntry = null as Entry | null;

        idToEntry[entryId].outIds.some(id => {
          if (idToEntry[id].arrowId === link.id) {
            existingEntry = idToEntry[id];
          }
          return !!existingEntry;
        });

        if (!existingEntry) {
          const linkEntryId = v4();
          const targetEntryId = v4();
          
          const linkEntry: Entry = {
            id: linkEntryId,
            userId: link.userId,
            parentId: entryId,
            arrowId: link.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: entryId,
            targetId: targetEntryId,
            shouldGetLinks: false,
          };
          idToEntry1[linkEntry.id] = linkEntry;

          const targetEntry: Entry = {
            id: targetEntryId,
            userId: link.target.userId,
            parentId: linkEntryId,
            arrowId: link.target.id,
            showIns: false,
            showOuts: false,
            inIds: [],
            outIds: [],
            sourceId: null,
            targetId: null,
            shouldGetLinks: false,
          }
          idToEntry1[targetEntry.id] = targetEntry;


          if (idToEntry1[entryId]) {
            idToEntry1[entryId].outIds = [...idToEntry1[entryId].outIds, linkEntry.id];
          }
          else {
            idToEntry1[entryId] = {
              ...idToEntry[entryId],
              outIds: [...idToEntry[entryId].outIds, linkEntry.id],
              showOuts: true,
              showIns: false,
              shouldGetLinks: false,
            }
          }
        }
      })

      dispatch(mergeArrows(arrows));
      dispatch(mergeEntries(idToEntry1));
    },
    fetchPolicy: 'network-only',
  });

  const getOuts = (offset: number) => {
    getOutArrows({
      variables: {
        accessToken,
        arrowId,
        offset,
      }
    });
  }
  return { getOuts }
}
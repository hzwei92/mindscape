import { gql, useMutation } from '@apollo/client';
import { useIonToast } from '@ionic/react';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { Entry } from './entry';
import { mergeEntries, selectIdToEntry } from './entrySlice';
import { VOTE_FIELDS } from '../vote/voteFragments';
import { Arrow } from '../arrow/arrow';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { mergeArrows } from '../arrow/arrowSlice';
import { mergeUsers } from '../user/userSlice';

const GET_INS = gql`
  mutation GetIns($arrowId: String!, $offset: Int!) {
    getIns(arrowId: $arrowId, offset: $offset) {
      user {
        id
        loadInsDate
      }
      arrows {
        ...FullArrowFields
        source {
          ...FullArrowFields
        }
        target {
          id
          inCount
        }
        votes {
          ...VoteFields
        }
      }
    }
  }
  ${FULL_ARROW_FIELDS}
  ${VOTE_FIELDS}
`;

export default function useGetIns(entryId: string, arrowId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const idToEntry = useAppSelector(selectIdToEntry);

  const [getInArrows] = useMutation(GET_INS, {
    onError: error => {
      present('Error gettings arrows: ' + error.message, 3000);
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }
    },
    onCompleted: data => {
      console.log(data);

      const arrows: Arrow[] = [];

      const idToEntry1: IdToType<Entry> = {};

      data.getIns.arrows.forEach((link: Arrow) => {
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
            isDeleted: false,
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
            isDeleted: false,
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

      dispatch(mergeUsers([data.getIns.user]));
      dispatch(mergeArrows(arrows));
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
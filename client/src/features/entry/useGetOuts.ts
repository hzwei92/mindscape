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

const GET_OUTS = gql`
  mutation GetOuts($arrowId: String!, $offset: Int!) {
    getOuts(arrowId: $arrowId, offset: $offset) {
      user {
        id
        loadOutsDate
      }
      arrows {
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
  }
  ${FULL_ARROW_FIELDS}
  ${VOTE_FIELDS}
`;

export default function useGetOuts(entryId: string, arrowId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const idToEntry = useAppSelector(selectIdToEntry);

  const [getOutArrows] = useMutation(GET_OUTS, {
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

      data.getOuts.arrows.forEach((link: Arrow) => {
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
            isDeleted: false,
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
            isDeleted: false,
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

      dispatch(mergeUsers([data.getOuts.user]));
      dispatch(mergeArrows(arrows));
      dispatch(mergeEntries(idToEntry1));
    },
    fetchPolicy: 'network-only',
  });

  const getOuts = (offset: number) => {
    getOutArrows({
      variables: {
        arrowId,
        offset,
      }
    });
  }
  return { getOuts }
}
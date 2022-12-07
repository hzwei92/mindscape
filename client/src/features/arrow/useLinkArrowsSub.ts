import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { selectSessionId } from '../auth/authSlice';
import { Entry } from '../entry/entry';
import { mergeEntries, removeEntries, selectIdToEntry } from '../entry/entrySlice';
import { mergeUsers } from '../user/userSlice';
import { mergeVotes } from '../vote/voteSlice';
import { FULL_ARROW_FIELDS } from './arrowFragments';
import { mergeArrows, selectArrowIdToInstanceIds } from './arrowSlice';

const LINK_ARROWS = gql`
  subscription LinkArrows($sessionId: String!, $arrowIds: [String!]!) {
    linkArrows(sessionId: $sessionId, arrowIds: $arrowIds) {
      source {
        ...FullArrowFields
      }
      target {
        ...FullArrowFields
      }
      link {
        ...FullArrowFields
      }
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useLinkArrowsSub() {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);
  const idToEntry = useAppSelector(selectIdToEntry);

  useSubscription(LINK_ARROWS, {
    shouldResubscribe: true,
    variables: {
      sessionId,
      arrowIds: Object.keys(arrowIdToInstanceIds),
    },
    onSubscriptionData: ({subscriptionData: {data: {linkArrows}}}) => {
      console.log(linkArrows);

      const {
        source,
        target,
        link,
      } = linkArrows;
      
      if (link.deleteDate) {
        const idToEntry1: IdToType<Entry> = {};
        const deletionIds: string[] = [];

        Object.keys(idToEntry).forEach(entryId => {
          const entry = idToEntry[entryId];
          if (entry.arrowId === link.id) {
            const parent = idToEntry[entry.parentId ?? ''];
            
            idToEntry1[parent.id] = {
              ...parent,
              inIds: parent.inIds.filter(id => id !== entryId),
              outIds: parent.outIds.filter(id => id !== entryId),
            };

            deletionIds.push(entryId);
          } 
        });

        dispatch(mergeEntries(idToEntry1));
        dispatch(removeEntries(deletionIds))
        dispatch(mergeArrows([link]));
      }
      else {
        const idToEntry1: IdToType<Entry> = {};
        Object.keys(idToEntry).forEach(entryId => {
          const entry = idToEntry[entryId];
          if (
            entry.arrowId === link.sourceId && 
            entry.showOuts
          ) {
            if (!entry.outIds.some(id => idToEntry[id].arrowId === link.id)) {
              const linkEntryId = v4();
              const targetEntryId = v4();

                        
              idToEntry1[entry.id] = {
                ...entry,
                outIds: [linkEntryId, ...entry.outIds],
              };

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
                userId: target.userId,
                parentId: linkEntryId,
                arrowId: target.id,
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
            }
          }
          else if (
            entry.arrowId === link.targetId && 
            entry.showIns
          ) {
            if (!entry.inIds.some(id => idToEntry[id].arrowId === link.targetId)) {
              const linkEntryId = v4();
              const sourceEntryId = v4();
    
              idToEntry1[entry.id] = {
                ...entry,
                inIds: [linkEntryId, ...entry.inIds],
              };

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
                userId: source.userId,
                parentId: linkEntryId,
                arrowId: source.id,
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
            }
          }
        });

        dispatch(mergeEntries(idToEntry1));
        dispatch(mergeArrows([source, target, link]));
        dispatch(mergeUsers([source.user, target.user, link.user]));
      }
    }
  });
}
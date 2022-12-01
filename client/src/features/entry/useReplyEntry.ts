import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { addEntry, selectIdToEntry, selectNewEntryId, updateEntry } from './entrySlice';
import { Entry } from './entry';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { mergeUsers, selectCurrentUser } from '../user/userSlice';
import { createArrow } from '../arrow/arrow';
import { mergeArrows, selectArrowById, selectIdToArrow } from '../arrow/arrowSlice';
import { selectFocusTab, selectFrameTab } from '../tab/tabSlice';
import { selectSessionId } from '../auth/authSlice';

const REPLY_ARROW = gql`
  mutation ReplyArrow(
    $sessionId: String!, 
    $sourceId: String!, 
    $linkId: String! 
    $targetId: String!, 
    $linkDraft: String!
    $targetDraft: String!
  ) {
    replyArrow(
      sessionId: $sessionId, 
      sourceId: $sourceId, 
      linkId: $linkId,
      targetId: $targetId, 
      linkDraft: $linkDraft,
      targetDraft: $targetDraft
    ) {
      user {
        id
        balance
      }
      source {
        id
        outCount
      }
      link {
        ...FullArrowFields
      }
      target {
        ...FullArrowFields
      }
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useReplyEntry() {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const user = useAppSelector(selectCurrentUser);

  const idToEntry = useAppSelector(selectIdToEntry);
  const newEntryId = useAppSelector(selectNewEntryId);

  const idToArrow = useAppSelector(selectIdToArrow);
  
  const [reply] = useMutation(REPLY_ARROW, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      const {
        user,
        source,
        link,
        target,
      } = data.replyArrow;

      dispatch(mergeUsers([user]));

      dispatch(mergeArrows([
        source,
        link,
        target,
      ]));
    },
  });

  const replyEntry = (entry: Entry) => {
    if (!user || newEntryId) return;

    const arrow = idToArrow[entry?.arrowId];

    const linkId = v4();
    const targetId = v4();

    const linkDraft = JSON.stringify({
      blocks: [{
        key: v4(),
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      }],
      entityMap: {}
    });

    const targetDraft = JSON.stringify({
      blocks: [{
        key: v4(),
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      }],
      entityMap: {}
    });

    reply({
      variables: {
        sessionId,
        sourceId: entry?.arrowId,
        linkId,
        targetId,
        linkDraft,
        targetDraft,
      }
    });
    
    const target = createArrow({
      id: targetId,
      user,
      draft: targetDraft,
      title: null,
      url: null,
      faviconUrl: null,
      abstract: null,
      sheaf: null,
      source: null,
      target: null,
    });

    const link = createArrow({
      id: linkId,
      user,
      draft: linkDraft,
      title: null,
      url: null,
      faviconUrl: null,
      abstract: null,
      sheaf: null,
      source: arrow,
      target,
    });
    
    dispatch(mergeArrows([target, link]));

    const targetEntryId = v4();
    const linkEntryId = v4();

    const targetEntry: Entry = {
      id: targetEntryId,
      userId: user.id,
      parentId: linkEntryId,
      arrowId: targetId,
      showIns: false,
      showOuts: true,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: false,
    };

    const linkEntry: Entry = {
      id: linkEntryId,
      userId: user.id,
      parentId: entry.id,
      arrowId: linkId,
      showIns: false,
      showOuts: false,
      inIds: [],
      outIds: [],
      sourceId: entry.id,
      targetId: targetEntryId,
      shouldGetLinks: false,
    };

    dispatch(addEntry(targetEntry));
    dispatch(addEntry(linkEntry));

    dispatch(updateEntry({
      ...entry,
      showIns: false,
      showOuts: true,
      outIds: [linkEntryId, ...idToEntry[entry.id].outIds]
    }));

  };

  return { replyEntry }
}
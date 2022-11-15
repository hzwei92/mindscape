import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { addEntry, selectIdToEntry, selectNewEntryId, updateEntry } from './entrySlice';
import { Entry } from './entry';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { mergeUsers, selectCurrentUser } from '../user/userSlice';
import { createArrow } from '../arrow/arrow';
import { mergeArrows, selectArrowById } from '../arrow/arrowSlice';
import { selectFocusTab, selectFrameTab } from '../tab/tabSlice';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';

const REPLY_ARROW = gql`
  mutation ReplyArrow(
    $accessToken: String!,
    $sessionId: String!, 
    $sourceId: String!, 
    $linkId: String! 
    $targetId: String!, 
    $linkDraft: String!
    $targetDraft: String!
  ) {
    replyArrow(
      accessToken: $accessToken,
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

export default function useReplyEntry(entryId: string) {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);

  const user = useAppSelector(selectCurrentUser);
  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  const idToEntry = useAppSelector(selectIdToEntry);
  const newEntryId = useAppSelector(selectNewEntryId);

  const entry = idToEntry[entryId];

  const arrow = useAppSelector(state => selectArrowById(state, entry.arrowId));
  
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

  const replyEntry = () => {
    if (!user || newEntryId) return;

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
        accessToken,
        sessionId,
        sourceId: entry.arrowId,
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
      parentId: entryId,
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
      ...idToEntry[entryId],
      showIns: false,
      showOuts: true,
      outIds: [linkEntryId, ...idToEntry[entryId].outIds]
    }));

  };

  return { replyEntry }
}
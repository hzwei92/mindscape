import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { addEntry, mergeEntries, selectIdToEntry, updateEntry } from './entrySlice';
import { Entry } from './entry';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { mergeUsers, selectCurrentUser } from '../user/userSlice';
import { createArrow } from '../arrow/arrow';
import { mergeArrows, selectArrowById } from '../arrow/arrowSlice';
import { useContext, useState } from 'react';
import { AppContext } from '../../app/App';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { useIonToast } from '@ionic/react';

const PASTE_ARROW = gql`
  mutation PasteArrow(
    $sessionId: String!, 
    $sourceId: String!, 
    $linkId: String! 
    $targetId: String!, 
    $linkDraft: String!
  ) {
    pasteArrow(
      sessionId: $sessionId, 
      sourceId: $sourceId, 
      linkId: $linkId,
      targetId: $targetId, 
      linkDraft: $linkDraft,
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

export default function usePasteEntry(entryId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  const { clipboardArrowIds } = useContext(AppContext);

  const clipboardArrow = useAppSelector(state => selectArrowById(state, clipboardArrowIds[0]));

  const user = useAppSelector(selectCurrentUser);

  const idToEntry = useAppSelector(selectIdToEntry);
  const entry = idToEntry[entryId];

  const arrow = useAppSelector(state => selectArrowById(state, entry.arrowId));

  const [newLinkId, setNewLinkId] = useState('');
  const [newTargetId, setNewTargetId] = useState('');
  
  const [paste] = useMutation(PASTE_ARROW, {
    onError: error => {
      present('Error pasting entry: ' + error.message, 3000);
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }
      dispatch(mergeEntries({
        [newLinkId]: {
          id: newLinkId,
          isDeleted: true,
        } as Entry,
        [newTargetId]: {
          id: newTargetId,
          isDeleted: true,
        } as Entry,
      }))
    },
    onCompleted: data => {
      console.log(data);

      const {
        user,
        source,
        link,
        target,
      } = data.pasteArrow;

      dispatch(mergeUsers([user]));

      dispatch(mergeArrows([
        source,
        link,
        target,
      ]));
    },
  });

  const pasteEntry = () => {
    if (!user) return;

    const targetEntryId = v4();
    const linkEntryId = v4();
    setNewTargetId(targetEntryId);
    setNewLinkId(linkEntryId);

    const linkId = v4();
    const target = clipboardArrow;

    if (!target) return;
    
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

    paste({
      variables: {
        sessionId,
        sourceId: entry.arrowId,
        linkId,
        targetId: target?.id,
        linkDraft,
      }
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
    
    dispatch(mergeArrows([link]));

    const targetEntry: Entry = {
      id: targetEntryId,
      userId: user.id,
      parentId: linkEntryId,
      arrowId: target?.id,
      showIns: false,
      showOuts: true,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: false,
      isDeleted: false,
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
      isDeleted:false,
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

  return { pasteEntry }
}
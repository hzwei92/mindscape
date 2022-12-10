import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { Arrow, createArrow } from '../arrow/arrow';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { useContext } from 'react';
import { createTwig, Twig } from './twig';
import { mergeTwigs } from '../space/spaceSlice';
import { SpaceContext } from '../space/SpaceComponent';
import { getEmptyDraft } from '../../utils';
import { mergeIdToPos, selectIdToPos } from '../space/spaceSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { useIonRouter, useIonToast } from '@ionic/react';
import { mergeUsers } from '../user/userSlice';

const REPLY_TWIG = gql`
  mutation ReplyTwig(
    $sessionId: String!, 
    $parentTwigId: String!, 
    $twigId: String!, 
    $postId: String!, 
    $x: Int!, 
    $y: Int!, 
    $draft: String!
  ) {
    replyTwig(
      sessionId: $sessionId, 
      parentTwigId: $parentTwigId, 
      twigId: $twigId, 
      postId: $postId, 
      x: $x, 
      y: $y, 
      draft: $draft
    ) {
      user {
        id
        balance
        replyN
        firstReplyDate
      }
      abstract {
        id
        twigZ
        twigN
        updateDate
      }
      source {
        id
        outCount
      }
      link {
        ...FullTwigFields
      }
      target {
        ...FullTwigFields
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

export default function useReplyTwig() {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const [present] = useIonToast();

  const { user, newTwigId, setNewTwigId } = useContext(AppContext);
  const { abstractId, abstract } = useContext(SpaceContext);

  const idToPos = useAppSelector(selectIdToPos(abstractId));

  const sessionId = useAppSelector(selectSessionId);
  
  const [reply] = useMutation(REPLY_TWIG, {
    onError: error => {
      present({
        message: 'Error replying: ' + error.message,
        position: 'bottom',
        duration: 3000,
      });
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }

      dispatch(mergeTwigs({
        abstractId,
        twigs: [{
          id: newTwigId,
          deleteDate: new Date().toISOString(),
        } as Twig],
      }));
    },
    onCompleted: data => {
      console.log(data);

      const {
        user,
        abstract,
        source,
        link,
        target
      } = data.replyTwig;

      dispatch(mergeUsers([user]));

      dispatch(mergeArrows([source, abstract]));
      
      dispatch(mergeTwigs({
        abstractId,
        twigs: [link, target]
      }));

      dispatch(mergeIdToPos({
        abstractId,
        idToPos: {
          [link.id]: {
            x: link.x,
            y: link.y,
          }
        }
      }));
    }
  });

  const replyTwig = (parentTwig: Twig, parentArrow: Arrow) => {
    if (!user || !abstract) return;

    const parentArrow1 = Object.assign({}, parentArrow, {
      outCount: parentArrow.outCount + 1,
    });
    
    dispatch(mergeArrows([parentArrow1]));
    
    const pos = idToPos[parentTwig.id];

    const dx = Math.round(pos.x) || (Math.random() - 0.5);
    const dy = Math.round(pos.y) || (Math.random() - 0.5);
    const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    console.log(dx, dy, dr);
    const postId = v4();
    const twigId = v4();
    const x = Math.round((300 * dx / dr) + pos.x + (100 * Math.random() - 50));
    const y = Math.round((300 * dy / dr) + pos.y + (100 * Math.random() - 50));

    console.log(x, y)

    const draft = getEmptyDraft();

    reply({
      variables: {
        sessionId,
        parentTwigId: parentTwig.id,
        twigId,
        postId,
        x,
        y,
        draft,
      },
    });

    const post = createArrow({
      id: postId,
      user,
      draft, 
      title: null, 
      url: null, 
      faviconUrl: null,
      abstract, 
      sheaf: null,
      source: null, 
      target: null,
    });

    const twig = createTwig({
      id: twigId,
      user,
      abstract, 
      detail: post, 
      parent: parentTwig, 
      x, 
      y, 
      isOpen: true, 
      windowId: null, 
      groupId: null, 
      tabId: null,
      bookmarkId: null, 
      source: null,
      target: null,
    });

    setNewTwigId(twig.id);

    dispatch(mergeIdToPos({
      abstractId,
      idToPos: {
        [twig.id]: {
          x,
          y,
        },
      },
    }));

    dispatch(mergeTwigs({
      abstractId,
      twigs: [twig],
    }))

    const abstract1 = Object.assign({}, abstract, {
      twigN: abstract?.twigN + 2,
    });

    dispatch(mergeArrows([abstract1]));

    router.push(`/g/${abstract.routeName}/${twig.i}`)
  }
  return { replyTwig }
}
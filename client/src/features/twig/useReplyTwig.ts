import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { Arrow, createArrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';
import { useContext } from 'react';
import { createTwig, Twig } from './twig';
import { mergeTwigs, setNewTwigId } from './twigSlice';
import { SpaceContext } from '../space/SpaceComponent';
import { getEmptyDraft } from '../../utils';
import { mergeIdToPos, selectIdToPos } from '../space/spaceSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { applyRole } from '../role/applyRole';
import { SpaceType } from '../space/space';
import { useIonToast } from '@ionic/react';

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

  const [present] = useIonToast();

  const { user } = useContext(AppContext);
  const { 
    space, 
    abstract,
  } = useContext(SpaceContext);

  const idToPos = useAppSelector(selectIdToPos(space));

  const sessionId = useAppSelector(selectSessionId);
  
  const [reply] = useMutation(REPLY_TWIG, {
    onError: error => {
      console.error(error);
      present({
        message: 'Error replying: ' + error.message,
        position: 'bottom',
      });
    },
    update: (cache, {data: {replyTwig}}) => {
      applyRole(cache, replyTwig.role);
    },
    onCompleted: data => {
      console.log(data);

      const {
        source,
        link,
        target
      } = data.replyTwig;
      dispatch(mergeArrows([source]));
      
      dispatch(mergeTwigs({
        space,
        twigs: [link, target]
      }));

      dispatch(mergeIdToPos({
        space,
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
    const x = Math.round((600 * dx / dr) + pos.x);
    const y = Math.round((600 * dy / dr) + pos.y);

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

    dispatch(setNewTwigId(twig.id));

    dispatch(mergeIdToPos({
      space,
      idToPos: {
        [twig.id]: {
          x,
          y,
        },
      },
    }));

    dispatch(mergeTwigs({
      space,
      twigs: [twig],
    }))

    const abstract1 = Object.assign({}, abstract, {
      twigN: abstract?.twigN + 2,
    });

    dispatch(mergeArrows([abstract1]));

    // navigate(`/g/${abstract.routeName}/${twig.i}`)
  }
  return { replyTwig }
}
import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { Arrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';
import { useContext } from 'react';
import { createTwig, Twig } from './twig';
import { SpaceContext } from '../space/SpaceComponent';
import { mergeIdToPos, mergeTwigs, selectIdToPos } from '../space/spaceSlice';
import { mergeArrows, selectIdToArrow } from '../arrow/arrowSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { applyRole } from '../role/applyRole';
import { useIonRouter, useIonToast } from '@ionic/react';
import { mergeUsers } from '../user/userSlice';

const PASTE_TWIG = gql`
  mutation PasteTwig(
    $sessionId: String!, 
    $parentTwigId: String!, 
    $twigId: String!, 
    $postId: String!, 
    $x: Int!, 
    $y: Int!, 
  ) {
    pasteTwig(
      sessionId: $sessionId, 
      parentTwigId: $parentTwigId, 
      twigId: $twigId, 
      postId: $postId, 
      x: $x, 
      y: $y, 
    ) {
      user {
        id
        balance
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

export default function usePasteTwig() {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const [present] = useIonToast();

  const { user, clipboardArrowIds, setNewTwigId } = useContext(AppContext);
  
  const { 
    abstractId, 
    abstract,
  } = useContext(SpaceContext);


  const idToArrow = useAppSelector(selectIdToArrow)
  const idToPos = useAppSelector(selectIdToPos(abstractId));

  const sessionId = useAppSelector(selectSessionId);
  
  const [paste] = useMutation(PASTE_TWIG, {
    onError: error => {
      console.error(error);
      present({
        message: 'Error pasting: ' + error.message,
        position: 'bottom',
      });
    },
    update: (cache, {data: {pasteTwig}}) => {
      applyRole(cache, pasteTwig.role);
    },
    onCompleted: data => {
      console.log(data);

      const {
        user,
        source,
        link,
        target
      } = data.pasteTwig;

      dispatch(mergeUsers([user]));
      
      dispatch(mergeArrows([source]));
      
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

  const pasteTwig = (parentTwig: Twig, parentArrow: Arrow) => {
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
    const twigId = v4();
    const x = Math.round((600 * dx / dr) + pos.x);
    const y = Math.round((600 * dy / dr) + pos.y);

    console.log(x, y)

    const post = idToArrow[clipboardArrowIds[0]]

    paste({
      variables: {
        sessionId,
        parentTwigId: parentTwig.id,
        twigId,
        postId: post.id,
        x,
        y,
      },
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
  return { pasteTwig }
}
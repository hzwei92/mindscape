import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from '../twig/twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import { AppContext, PendingLinkType } from '../../app/App';
import { FULL_ARROW_FIELDS } from './arrowFragments';
import { mergeArrows } from './arrowSlice';
import { mergeIdToPos } from '../space/spaceSlice';
import { IdToType } from '../../types';
import { PosType } from '../space/space';
import { Twig } from '../twig/twig';
import { mergeUsers } from '../user/userSlice';

const LINK_TWIGS = gql`
  mutation LinkTwigs($sessionId: String!, $abstractId: String!, $sourceId: String!, $targetId: String!) {
    linkTwigs(sessionId: $sessionId, abstractId: $abstractId, sourceId: $sourceId, targetId: $targetId) {
      user {
        id
        balance
      }
      abstract {
        id
        twigN
        twigZ
      }
      twigs {
        ...FullTwigFields
      }
      source {
        id
        outCount
        sheaf {
          id
          outCount
        }
      }
      target {
        id
        inCount
        sheaf {
          id
          inCount
        }
      }
      role {
        ...RoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${ROLE_FIELDS}
`;

const LINK_ARROWS = gql`
  mutation LinkArrows($sessionId: String!, $sourceId: String!, $targetId: String!) {
    linkArrows(sessionId: $sessionId, sourceId: $sourceId, targetId: $targetId) {
      user {
        id
        balance
      }
      source {
        id
        outCount
        sheaf {
          id
          outCount
        }
      }
      target {
        id
        inCount
        sheaf {
          id
          inCount
        }
      }
      link {
        ...FullArrowFields
      }
    }
  }
  ${FULL_ARROW_FIELDS}
`
export default function useLinkArrows() {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector(selectSessionId);

  const {
    setPendingLink,
  } = useContext(AppContext);

  const { 
    space, 
    abstract,
  } = useContext(SpaceContext);

  const [linkArrow] = useMutation(LINK_ARROWS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      
      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: '',
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });

      const { user, source, target, link } = data.linkArrows;
      dispatch(mergeUsers([user]));
      dispatch(mergeArrows([source, target, link]));
    },
  });

  const [linkTwig] = useMutation(LINK_TWIGS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      setPendingLink({
        sourceAbstractId: '',
        sourceArrowId: '',
        sourceTwigId: '',
        targetAbstractId: '',
        targetArrowId: '',
        targetTwigId: '',
      });

      dispatch(mergeUsers([data.linkTwigs.user]));
      
      dispatch(mergeTwigs({
        space,
        twigs: data.linkTwigs.twigs
      }));

      dispatch(mergeIdToPos({
        space,
        idToPos: data.linkTwigs.twigs.reduce((acc: IdToType<PosType>, twig: Twig) => {
          acc[twig.id] = {
            x: twig.x,
            y: twig.y,
          };
          return acc;
        }, {}),
      }));
    }
  });

  const linkArrows = (pendingLink: PendingLinkType) => {
    if (abstract?.id === pendingLink.sourceAbstractId && abstract?.id === pendingLink.targetAbstractId) {
      linkTwig({
        variables: {
          sessionId,
          abstractId: abstract.id,
          sourceId: pendingLink.sourceArrowId,
          targetId: pendingLink.targetArrowId,
        },
      });
    }
    else {
      linkArrow({
        variables: {
          sessionId,
          sourceId: pendingLink.sourceArrowId,
          targetId: pendingLink.targetArrowId,
        },
      });
    }
  }

  return { linkArrows }
}
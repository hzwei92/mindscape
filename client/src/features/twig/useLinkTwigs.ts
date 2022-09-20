import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from './twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import { AppContext, PendingLinkType } from '../../app/App';

const LINK_TWIGS = gql`
  mutation LinkTwigs($sessionId: String!, $abstractId: String!, $sourceId: String!, $targetId: String!) {
    linkTwigs(sessionId: $sessionId, abstractId: $abstractId, sourceId: $sourceId, targetId: $targetId) {
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
`
export default function useLinkTwigs() {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector(selectSessionId);

  const {
    setPendingLink,
  } = useContext(AppContext);

  const { 
    space, 
    abstract,
  } = useContext(SpaceContext);

  const [link] = useMutation(LINK_TWIGS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      setPendingLink({
        sourceArrowId: '',
        sourceTwigId: '',
        targetArrowId: '',
        targetTwigId: '',
      });

      dispatch(mergeTwigs({
        space,
        twigs: data.linkTwigs.twigs
      }));
    }
  });

  const linkTwigs = (pendingLink: PendingLinkType) => {
    if (!abstract) return;

    link({
      variables: {
        sessionId,
        abstractId: abstract.id,
        sourceId: pendingLink.sourceArrowId,
        targetId: pendingLink.targetArrowId,
      },
    });
  }

  return { linkTwigs }
}
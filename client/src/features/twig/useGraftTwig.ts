import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { sessionVar } from '../../cache';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SpaceType } from '../space/space';
import { mergeTwigs, selectIdToTwig } from './twigSlice';

const GRAFT = gql`
  mutation GraftTwig($sessionId: String!, $twigId: String!, $parentTwigId: String!) {
    graftTwig(sessionId: $sessionId, twigId: $twigId, parentTwigId: $parentTwigId) {
      twig {
        id
        parent {
          id
        }
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useGraftTwig(space: SpaceType) {
  const dispatch = useAppDispatch();
  const sessionDetail = useReactiveVar(sessionVar);

  const idToTwig = useAppSelector(selectIdToTwig(space));
  
  const [graft] = useMutation(GRAFT, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeTwigs({
        space,
        twigs: [data.graftTwig.twig]
      }));
    },
  });

  const graftTwig = (twigId: string, parentTwigId: string) => {
    const twig = idToTwig[twigId];

    if (twig.parent.id === parentTwigId) return;

    graft({
      variables: {
        sessionId: sessionDetail.id,
        twigId,
        parentTwigId,
      }
    });

    const twig1 = Object.assign({}, twig, {
      parent: idToTwig[parentTwigId],
    });

    dispatch(mergeTwigs({
      space,
      twigs: [twig1],
    }));
  }
  return { graftTwig };
}
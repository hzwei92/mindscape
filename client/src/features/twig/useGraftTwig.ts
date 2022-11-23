import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs, selectIdToTwig } from '../space/spaceSlice';

const GRAFT = gql`
  mutation GraftTwig($sessionId: String!, $twigId: String!, $parentTwigId: String!, $x: Int!, $y: Int!) {
    graftTwig(sessionId: $sessionId, twigId: $twigId, parentTwigId: $parentTwigId, x: $x, y: $y) {
      twig {
        id
        x
        y
        parent {
          id
        }
      }
      descs {
        id
        x
        y
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useGraftTwig(abstractId: string) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const idToTwig = useAppSelector(selectIdToTwig(abstractId));
  
  const [graft] = useMutation(GRAFT, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeTwigs({
        abstractId,
        twigs: [data.graftTwig.twig, ...data.graftTwig.descs],
      }));
    },
  });

  const graftTwig = (twigId: string, parentTwigId: string, x: number, y: number) => {
    const twig = idToTwig[twigId];

    if (twig.parent.id === parentTwigId) return;

    graft({
      variables: {
        sessionId,
        twigId,
        parentTwigId,
        x,
        y,
      }
    });

    const twig1 = Object.assign({}, twig, {
      parent: idToTwig[parentTwigId],
    });

    dispatch(mergeTwigs({
      abstractId,
      twigs: [twig1],
    }));
  }
  return { graftTwig };
}
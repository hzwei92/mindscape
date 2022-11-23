import { gql, useMutation } from '@apollo/client';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/applyRole';
import { selectSessionId } from '../auth/authSlice';
import { mergeTwigs } from '../space/spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';

const MOVE_TWIG = gql`
  mutation MoveTwig($sessionId: String!, $twigId: String!, $x: Int!, $y: Int!) {
    moveTwig(sessionId: $sessionId, twigId: $twigId, x: $x, y: $y) {
      twigs {
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

export default function useMoveTwig(abstractId: string) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);
  
  const [move] = useMutation(MOVE_TWIG, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {moveTwig}}) => {
      applyRole(cache, moveTwig.role);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeTwigs({
        abstractId,
        twigs: data.moveTwig.twigs,
      }))
    },
  });

  const moveTwig = (twigId: string, x: number, y: number) => {
    move({
      variables: {
        sessionId,
        twigId,
        x,
        y,
      },
    });
  }

  return { moveTwig };
}
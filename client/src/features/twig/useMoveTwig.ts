import { gql, useMutation } from '@apollo/client';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/applyRole';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';
import { mergeTwigs } from './twigSlice';
import { SpaceType } from '../space/space';
import { useAppDispatch, useAppSelector } from '../../app/store';

const MOVE_TWIG = gql`
  mutation MoveTwig($accessToken: String!, $sessionId: String!, $twigId: String!, $x: Int!, $y: Int!) {
    moveTwig(accessToken: $accessToken, sessionId: $sessionId, twigId: $twigId, x: $x, y: $y) {
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

export default function useMoveTwig(space: SpaceType) {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
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
        space,
        twigs: data.moveTwig.twigs,
      }))
    },
  });

  const moveTwig = (twigId: string, x: number, y: number) => {
    move({
      variables: {
        accessToken, 
        sessionId,
        twigId,
        x,
        y,
      },
    });
  }

  return { moveTwig };
}
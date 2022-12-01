import { gql, useMutation } from '@apollo/client';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { mergeTwigs } from '../space/spaceSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { useIonToast } from '@ionic/react';

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

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);
  
  const [move] = useMutation(MOVE_TWIG, {
    onError: error => {
      present('Error moving twig: ' + error.message, 3000);

      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
      else {
        console.error(error);
      }
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
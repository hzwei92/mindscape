import { gql, useMutation } from '@apollo/client';
import { useIonToast } from '@ionic/react';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs, selectIdToTwig } from '../space/spaceSlice';
import useSetUserGraftTwigDate from '../user/useSetUserGraftTwigDate';

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

  const [present] = useIonToast();

  const { user } = useContext(AppContext);

  const sessionId = useAppSelector(selectSessionId);

  const idToTwig = useAppSelector(selectIdToTwig(abstractId));

  const { setUserGraftTwigDate } = useSetUserGraftTwigDate();
  
  const [graft] = useMutation(GRAFT, {
    onError: error => {
      present('Error grafting twig: ' + error.message, 3000);
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
        twigs: [data.graftTwig.twig, ...data.graftTwig.descs],
      }));
    },
  });

  const graftTwig = (twigId: string, parentTwigId: string, x: number, y: number) => {
    const twig = idToTwig[twigId];
    const parentTwig = idToTwig[parentTwigId];
    if (
      twig.parent?.id === parentTwigId ||
      parentTwig.sourceId === twigId ||
      parentTwig.targetId === twigId
    ) return;

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

    if (user?.openLinkDate && !user.graftTwigDate) {
      setUserGraftTwigDate();
    }
  }
  return { graftTwig };
}
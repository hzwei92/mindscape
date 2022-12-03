import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import type { Twig } from './twig';
import { mergeTwigs } from '../space/spaceSlice';
import { useIonToast } from '@ionic/react';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';

const OPEN_TWIG = gql`
  mutation OpenTwig($sessionId: String!, $twigId: String!, $shouldOpen: Boolean!) {
    openTwig(sessionId: $sessionId, twigId: $twigId, shouldOpen: $shouldOpen) {
      twig {
        id
        isOpen
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

const useOpenTwig = () => {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const { abstractId } = useContext(SpaceContext);

  const sessionId = useAppSelector(selectSessionId);

  const [open] = useMutation(OPEN_TWIG, {
    onError: error => {
      present('Error modifying twig: ' + error.message, 3000);
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
        twigs: [data.openTwig.twig],
      }))
    }
  });

  const openTwig = (twig: Twig, shouldOpen: boolean) => {
    open({
      variables: {
        sessionId,
        twigId: twig.id,
        shouldOpen,
      }
    });

    const twig1 = {
      ...twig,
      isOpen: shouldOpen,
    };

    dispatch(mergeTwigs({
      abstractId,
      twigs: [twig1],
    }));
  }
  return { openTwig }
}

export default useOpenTwig
import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectAccessToken, selectSessionId } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import type { Twig } from './twig';
import { mergeTwigs } from './twigSlice';

const OPEN_TWIG = gql`
  mutation OpenTwig($accessToken: String!, $sessionId: String!, $twigId: String!, $shouldOpen: Boolean!) {
    openTwig(accessToken: $accessToken, sessionId: $sessionId, twigId: $twigId, shouldOpen: $shouldOpen) {
      twig {
        id
        isOpen
      }
    }
  }
`;

const useOpenTwig = () => {
  const dispatch = useAppDispatch();

  const { space } = useContext(SpaceContext);

  const accessToken = useAppSelector(selectAccessToken);
  const sessionId = useAppSelector(selectSessionId);

  const [open] = useMutation(OPEN_TWIG, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {openTwig}}) => {
      //applyRole(cache, openTwig.role);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const openTwig = (twig: Twig, shouldOpen: boolean) => {
    open({
      variables: {
        accessToken,
        sessionId,
        twigId: twig.id,
        shouldOpen,
      }
    });

    const twig1 = Object.assign({}, twig, {
      isOpen: shouldOpen,
    });

    dispatch(mergeTwigs({
      space,
      twigs: [twig1],
    }));
  }
  return { openTwig }
}

export default useOpenTwig
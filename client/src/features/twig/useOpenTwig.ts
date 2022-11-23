import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import type { Twig } from './twig';
import { mergeTwigs } from '../space/spaceSlice';

const OPEN_TWIG = gql`
  mutation OpenTwig($sessionId: String!, $twigId: String!, $shouldOpen: Boolean!) {
    openTwig(sessionId: $sessionId, twigId: $twigId, shouldOpen: $shouldOpen) {
      twig {
        id
        isOpen
      }
    }
  }
`;

const useOpenTwig = () => {
  const dispatch = useAppDispatch();

  const { abstractId } = useContext(SpaceContext);

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
        sessionId,
        twigId: twig.id,
        shouldOpen,
      }
    });

    const twig1 = Object.assign({}, twig, {
      isOpen: shouldOpen,
    });

    dispatch(mergeTwigs({
      abstractId,
      twigs: [twig1],
    }));
  }
  return { openTwig }
}

export default useOpenTwig
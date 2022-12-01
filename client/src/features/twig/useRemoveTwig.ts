import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId } from '../auth/authSlice';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SpaceContext } from '../space/SpaceComponent';
import { mergeTwigs, selectIdToChildIdToTrue, selectIdToDescIdToTrue, selectIdToTwig } from '../space/spaceSlice';
import type { Twig } from './twig';

const REMOVE_TWIG = gql`
  mutation RemoveTwig($sessionId: String!, $twigId: String!, $shouldRemoveDescs: Boolean!) {
    removeTwig(sessionId: $sessionId, twigId: $twigId, shouldRemoveDescs: $shouldRemoveDescs) {
      twigs {
        id
        deleteDate
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useRemoveTwig() {
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);
  const { abstractId, canEdit } = useContext(SpaceContext);

  const sessionId = useAppSelector(selectSessionId);
  
  const idToTwig = useAppSelector(selectIdToTwig(abstractId));
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(abstractId));
  const idToChildIdToTrue = useAppSelector(selectIdToChildIdToTrue(abstractId));

  const [remove] = useMutation(REMOVE_TWIG, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const removeTwig = (twig: Twig, shouldRemoveDescs: boolean) => {
    if (twig.userId === user?.id || canEdit) {
      remove({
        variables: {
          sessionId,
          twigId: twig.id,
          shouldRemoveDescs,
        }
      });
    }

    const date = new Date().toISOString();

    let twigs: Twig[] ;
    if (shouldRemoveDescs) {
      twigs = [twig.id, ...Object.keys(idToDescIdToTrue[twig.id] || {})].map(twigId => {
        const twig = idToTwig[twigId];
        return Object.assign({}, twig, {
          deleteDate: date,
        });
      });
    }
    else {
      twigs = [Object.assign({}, twig, {
        deleteDate: date,
      })];

      Object.keys(idToChildIdToTrue[twig.id] || {}).forEach(childId => {
        const child = idToTwig[childId];
        if (child) {
          twigs.push(Object.assign({}, child, {
            parent: twig.parent,
          }));
        }
      });
    }

    Object.values(idToTwig).forEach(twig => {
      const shouldRemove = twigs.some(twig1 => 
        twig1.id === twig.sourceId || twig1.id === twig.targetId
      );
      if (shouldRemove) {
        twigs.push(Object.assign({}, twig, {
          deleteDate: date,
        }));
      }
    })

    dispatch(mergeTwigs({
      abstractId,
      twigs,
    }));
  }

  return { removeTwig };
}
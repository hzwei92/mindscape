import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useIonToast } from '@ionic/react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSessionId, setAuthIsComplete, setAuthIsInit, setAuthIsValid } from '../auth/authSlice';
import { mergeArrows, selectArrowIdToInstanceIds, selectIdToInstance, updateInstance } from './arrowSlice';

const SAVE_ARROW = gql`
  mutation SaveArrow($sessionId: String!, $arrowId: String!, $draft: String!) {
    saveArrow(sessionId: $sessionId, arrowId: $arrowId, draft: $draft) {
      id
      draft
      text
      saveDate
    }
  }
`;

export default function useSaveArrow(arrowId: string, instanceId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  const idToInstance = useAppSelector(selectIdToInstance);
  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);

  const [save] = useMutation(SAVE_ARROW, {
    onError: error => {
      console.error(error);
      present({
        message: 'Error saving arrow: ' + error.message,
      })
      if (error.message === 'Unauthorized') {
        dispatch(setAuthIsInit(false));
        dispatch(setAuthIsValid(false));
      }
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeArrows([data.saveArrow]));
      arrowIdToInstanceIds[arrowId].forEach(id => {
        if (id === instanceId) {
          dispatch(updateInstance({
            ...idToInstance[id],
            isNewlySaved: true,
          }));
        }
        else {
          dispatch(updateInstance({
            ...idToInstance[id],
            shouldRefreshDraft: true,
          }));
        }
      });
    },
  });

  const saveArrow = (draft: string) => {
    save({
      variables: {
        sessionId,
        arrowId,
        draft,
      }
    });
  }

  return { saveArrow }
}
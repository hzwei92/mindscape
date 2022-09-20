import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { useContext } from 'react';
import { sessionVar } from '../../cache';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { mergeArrows, selectArrowIdToInstanceIds, selectIdToInstance, updateInstance } from './arrowSlice';
import { AppContext } from '../../app/App';

const SAVE_ARROW = gql`
  subscription SaveArrow($sessionId: String!, $userId: String!, $arrowIds: [String!]!) {
    saveArrow(sessionId: $sessionId, userId: $userId, arrowIds: $arrowIds) {
      id
      draft
      saveDate
    }
  }
`
export default function useSaveArrowSub() {
  const dispatch = useAppDispatch();

  const {
    user,
  } = useContext(AppContext);

  const sessionDetail = useReactiveVar(sessionVar);

  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);
  const idToInstance = useAppSelector(selectIdToInstance);

  useSubscription(SAVE_ARROW, {
    shouldResubscribe: true,
    variables: {
      sessionId: sessionDetail.id,
      userId: user?.id,
      arrowIds: Object.keys(arrowIdToInstanceIds),
    },
    onSubscriptionData: ({subscriptionData: {data: {saveArrow}}}) => {
      console.log(saveArrow);

      dispatch(mergeArrows([saveArrow]));

      const instanceIds = arrowIdToInstanceIds[saveArrow.id];

      instanceIds.forEach(id => {
        dispatch(updateInstance({
          ...idToInstance[id],
          shouldRefreshDraft: true,
        }))
      });
    },
  });
}
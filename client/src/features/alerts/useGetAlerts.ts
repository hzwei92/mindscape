import { gql, useMutation } from "@apollo/client";
import { useIonToast } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { IdToType } from "../../types";
import { selectIdToArrow } from "../arrow/arrowSlice";
import { Entry } from "../entry/entry";
import { mergeEntries, selectIdToEntry } from "../entry/entrySlice";
import { mapAlertToEntry } from "../entry/mapAlertToEntry";
import { MenuMode } from "../menu/menu";
import { searchPushSlice, selectSearchSlice } from "../search/searchSlice";
import { mergeUsers } from "../user/userSlice";
import { Alert, AlertReason } from "./alert";
import { FULL_ALERT_FIELDS } from "./alertFragments";
import { mergeAlerts } from "./alertSlice";

const GET_ALERTS = gql`
  mutation GetCurrentUserAlerts {
    getCurrentUserAlerts {
      user {
        id
        loadFeedDate
      }
      alerts {
        ...FullAlertFields
      }
    }
  }
  ${FULL_ALERT_FIELDS}
`;

export default function useGetAlerts() {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const { user, setMenuMode } = useContext(AppContext);

  const idToArrow = useAppSelector(selectIdToArrow);
  const idToEntry = useAppSelector(selectIdToEntry);
  const slice = useAppSelector(selectSearchSlice);

  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    setIsInit(false);
  }, [user?.id])

  const [get] = useMutation(GET_ALERTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      const { user, alerts } = data.getCurrentUserAlerts;

      dispatch(mergeUsers([user]));
      dispatch(mergeAlerts(alerts));


      const { 
        entryIds, 
        idToEntry: idToEntry1
      } = mapAlertToEntry(user, idToArrow, alerts);


      if (
        slice.entryIds.length !== entryIds.length ||
        slice.entryIds.some((id, index) => idToEntry[id].arrowId !== idToEntry1[entryIds[index]].arrowId)
      ) {
        if (isInit) {
          const isFeed = alerts.some((alert: Alert) => alert.reason === AlertReason.FEED);
          if (isFeed) {
            present('Feed received!', 1000)
          }
          else {
            present('Notifications received!', 1000)
          }
        }

        dispatch(mergeEntries(idToEntry1));
        dispatch(searchPushSlice({
          originalQuery: '',
          query: '',
          entryIds,
          userIds: [],
        }))
      }
      else {
        present('Your feed is up to date!', 1000)
      }

      if (isInit) {
        setMenuMode(MenuMode.SEARCH);
      }
      else {
        setIsInit(true);
      }
    }
  });

  const getAlerts = () => {
    get()
  }

  return { getAlerts };
}
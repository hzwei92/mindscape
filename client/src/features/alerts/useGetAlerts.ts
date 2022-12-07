import { gql, useMutation } from "@apollo/client";
import { useContext, useState } from "react";
import { v4 } from "uuid";
import { AppContext } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { IdToType } from "../../types";
import { Entry } from "../entry/entry";
import { mergeEntries, selectIdToEntry } from "../entry/entrySlice";
import { MenuMode } from "../menu/menu";
import { searchPushSlice, selectSearchSlice } from "../search/searchSlice";
import { Alert, AlertReason } from "./alert";
import { FULL_ALERT_FIELDS } from "./alertFragments";
import { mergeAlerts } from "./alertSlice";

const GET_ALERTS = gql`
  mutation GetCurrentUserAlerts {
    getCurrentUserAlerts {
      ...FullAlertFields
    }
  }
  ${FULL_ALERT_FIELDS}
`;

export default function useGetAlerts() {
  const dispatch = useAppDispatch();

  const { setMenuMode } = useContext(AppContext);

  const idToEntry = useAppSelector(selectIdToEntry);
  const slice = useAppSelector(selectSearchSlice);

  const [isInit, setIsInit] = useState(false);

  const [get] = useMutation(GET_ALERTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeAlerts(data.getCurrentUserAlerts));

      const entryIds: string[] = [];
      const idToEntry1: IdToType<Entry> = {};

      let isNotFeed = data.getCurrentUserAlerts
      .sort((a: Alert, b: Alert) => a.createDate > b.createDate ? -1 : 1)
      .forEach((alert: Alert) => {
        if (alert.reason !== AlertReason.FEED) {
          return true;
        }
        if (!alert.source || !alert.link || !alert.target) return false;

        const sourceEntry: Entry = {
          id: v4(),
          userId: alert.source.userId,
          parentId: null,
          arrowId: alert.source.id,
          showIns: false,
          showOuts: true,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
          isDeleted: false,
        };
        idToEntry1[sourceEntry.id] = sourceEntry;
        entryIds.push(sourceEntry.id);

        const targetEntryId = v4();

        const linkEntry: Entry = {
          id: v4(),
          userId: alert.link.userId,
          parentId: sourceEntry.id,
          arrowId: alert.link.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: sourceEntry.id,
          targetId: targetEntryId,
          shouldGetLinks: false,
          isDeleted: false,
        };

        idToEntry1[linkEntry.id] = linkEntry;
        sourceEntry.outIds.push(linkEntry.id);

        const targetEntry: Entry = {
          id: targetEntryId,
          userId: alert.target.userId,
          parentId: linkEntry.id,
          arrowId: alert.target.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
          isDeleted: false,
        };
        idToEntry1[targetEntry.id] = targetEntry;

        return false;
      });

      if (!isNotFeed) {
        if (
          slice.entryIds.length !== entryIds.length ||
          slice.entryIds.some((id, index) => idToEntry[id].arrowId !== idToEntry1[entryIds[index]].arrowId)
        ) {
          dispatch(mergeEntries(idToEntry1));
          dispatch(searchPushSlice({
            originalQuery: '',
            query: '',
            entryIds,
            userIds: [],
          }))

          if (isInit) {
            setMenuMode(MenuMode.SEARCH);
          }
        }
      }
      setIsInit(true);
    }
  });

  const getAlerts = () => {
    get()
  }

  return { getAlerts };
}
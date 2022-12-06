import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IdToType } from "../../types";
import { mergeAlerts } from "../alerts/alertSlice";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeTwigs } from "../space/spaceSlice";
import { mergeTabs } from "../tab/tabSlice";
import type { Arrow, ArrowInstance } from "./arrow";

export interface ArrowState {
  idToArrow: IdToType<Arrow>;
  urlToArrowId: IdToType<string>;
  idToInstance: IdToType<ArrowInstance>;
  arrowIdToInstanceIds: IdToType<string[]>;
};

const initialState: ArrowState = {
  idToArrow: {},
  urlToArrowId: {},
  idToInstance: {},
  arrowIdToInstanceIds: {},
};

const arrowSlice = createSlice({
  name: 'arrow',
  initialState,
  reducers: {
    mergeArrows: (state, action: PayloadAction<Arrow[]>) => {
      const {
        idToArrow,
        urlToArrowId,
      } = action.payload.reduce((acc, arrow) => {
        if (arrow.deleteDate) {
          if (arrow.id) {
            delete acc.idToArrow[arrow.id];
            if (arrow.url) {
              delete acc.urlToArrowId[arrow.url];
            }
          }
        }
        else {
          if (arrow.id) {
            acc.idToArrow[arrow.id] = {
              ...acc.idToArrow[arrow.id], 
              ...arrow,
            };
            if (arrow.url) {
              acc.urlToArrowId[arrow.url] = arrow.id;
            }
          }
        }
        return acc;
      }, {
        idToArrow: { ...state.idToArrow },
        urlToArrowId: { ...state.urlToArrowId } as IdToType<string>,
      });

      return {
        ...state,
        idToArrow,
        urlToArrowId,
      }
    },
    addInstance: (state, action: PayloadAction<ArrowInstance>) => {
      return {
        ...state,
        idToInstance: {
          ...state.idToInstance,
          [action.payload.id]: action.payload,
        },
        arrowIdToInstanceIds: {
          ...state.arrowIdToInstanceIds,
          [action.payload.arrowId]: [
            ...(state.arrowIdToInstanceIds[action.payload.arrowId] || []),
            action.payload.id,
          ],
        },
      };
    },
    updateInstance: (state, action: PayloadAction<ArrowInstance>) => {
      return {
        ...state,
        idToInstance: {
          ...state.idToInstance,
          [action.payload.id]: action.payload,
        }
      };
    },
    removeInstance: (state, action: PayloadAction<string>) => {
      const idToInstance: IdToType<ArrowInstance> = {
        ...state.idToInstance,
      };
      const arrowIdToInstanceIds:IdToType<string[]> = {
        ...state.arrowIdToInstanceIds,
      }
      delete idToInstance[action.payload];
      const instance = state.idToInstance[action.payload];
      if (instance) {
        arrowIdToInstanceIds[instance.arrowId] = arrowIdToInstanceIds[instance.arrowId]
          .filter(instanceId => instanceId !== action.payload);
        if (!arrowIdToInstanceIds[instance.arrowId].length) {
          delete arrowIdToInstanceIds[instance.arrowId];
        }
      }
      return {
        ...state,
        idToInstance,
        arrowIdToInstanceIds,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setInit, (state, action) => {
        if (!action.payload) {
          return initialState;
        }
      })
      .addCase(setLogout, () => {
        return initialState;
      })
      .addCase(setLogin, (state, action) => {
        const {
          idToArrow,
          urlToArrowId,
        } = (action.payload?.tabs || []).reduce((acc, tab) => {
          if (tab.arrow?.id) {
            acc.idToArrow[tab.arrow.id] = tab.arrow;
            
            if (tab.arrow.url) {
              acc.urlToArrowId[tab.arrow.url] = tab.arrow.id
            }
          } 
          return acc;
        }, {
          idToArrow: { ...state.idToArrow } as IdToType<Arrow>,
          urlToArrowId: { ...state.urlToArrowId } as IdToType<string>,
        });

        return {
          ...state,
          idToArrow,
          urlToArrowId,
        };
      })
      .addCase(mergeTwigs, (state, action) => {
        const {
          idToArrow,
          urlToArrowId,
        } = action.payload.twigs.reduce((acc, twig) => {
          if (twig.detail) {
            acc.idToArrow[twig.detail.id] = {
              ...acc.idToArrow[twig.detail.id], 
              ...twig.detail,
            };
            if (twig.detail.url) {
              acc.urlToArrowId[twig.detail.url] = twig.detail.id;
            }
          }
          return acc;
        }, {
          idToArrow: { ...state.idToArrow },
          urlToArrowId: { ...state.urlToArrowId },
        });

        return {
          ...state,
          idToArrow,
          urlToArrowId,
        }
      })
      .addCase(mergeTabs, (state, action) => {
        const {
          idToArrow,
          urlToArrowId,
        } = action.payload.reduce((acc, tab) => {
          if (tab.arrow?.id) {
            acc.idToArrow[tab.arrow.id] = {
              ...acc.idToArrow[tab.arrow.id], 
              ...tab.arrow,
            };
            if (tab.arrow.url) {
              acc.urlToArrowId[tab.arrow.url] = tab.arrow.id;
            }
          }
          return acc;
        }, {
          idToArrow: { ...state.idToArrow },
          urlToArrowId: { ...state.urlToArrowId },
        });

        return {
          ...state,
          idToArrow,
          urlToArrowId,
        }
      })
      .addCase(mergeAlerts, (state, action) => {
        const {
          idToArrow,
          urlToArrowId,
        } = action.payload.reduce((acc, alert) => {
          if (alert.arrow?.id) {
            acc.idToArrow[alert.arrow.id] = {
              ...acc.idToArrow[alert.arrow.id], 
              ...alert.arrow,
            };
            if (alert.arrow.url) {
              acc.urlToArrowId[alert.arrow.url] = alert.arrow.id;
            }
          }
          return acc;
        }, {
          idToArrow: { ...state.idToArrow },
          urlToArrowId: { ...state.urlToArrowId },
        });

        return {
          ...state,
          idToArrow,
          urlToArrowId,
        }
      })
  }
});

export const { 
  mergeArrows,
  addInstance,
  updateInstance,
  removeInstance,
} = arrowSlice.actions;

export const selectIdToArrow = (state: RootState) => state.arrow.idToArrow;
export const selectUrlToArrowId = (state: RootState) => state.arrow.urlToArrowId;
export const selectIdToInstance = (state: RootState) => state.arrow.idToInstance;
export const selectArrowIdToInstanceIds = (state: RootState) => state.arrow.arrowIdToInstanceIds;

export const selectArrowById = createSelector(
  [
    selectIdToArrow,
    (state, id: string | null | undefined) => id,
  ],
  (idToArrow, id): Arrow | null => {
    if (id) {
      return idToArrow[id] || null;
    }
    return null;
  }
);

export const selectInstanceById = createSelector(
  [
    selectIdToInstance,
    (state: RootState, instanceId: string) => instanceId,
  ],
  (idToInstance, instanceId): ArrowInstance => idToInstance[instanceId],
)

export default arrowSlice.reducer;
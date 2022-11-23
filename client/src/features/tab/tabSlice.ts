import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../../app/store';
import { IdToType } from "../../types";
import { Tab } from "./tab";
import { setInit, setLogin, setLogout } from "../auth/authSlice";

export interface TabState {
  idToTab: IdToType<Tab>;
}

const initialState: TabState = {
  idToTab: {},
};

const authSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    mergeTabs: (state, action: PayloadAction<Tab[]>) => {
      return {
        ...state,
        idToTab: action.payload.reduce((acc, tab) => {
          acc[tab.id] = {
            ...acc[tab.id],
            ...tab
          };
          return acc;
        }, {
          ...state.idToTab
        }),
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
      .addCase(setLogin, (state, action) => {
        const idToTab = (action.payload?.tabs || []).reduce((acc: IdToType<Tab>, tab) => {
          acc[tab.id] = tab;
          return acc;
        }, {});
        return {
          ...state,
          idToTab,
        };
      })
      .addCase(setLogout, (state, action) => {
        return initialState;
      })
  }
});

export const {
  mergeTabs,
} = authSlice.actions;

export const selectIdToTab = (state: RootState) => state.tab.idToTab

export const selectFrameTab = createSelector(
  [
    selectIdToTab,
  ],
  (idToTab: IdToType<Tab>) => {
    return Object.values(idToTab).find(tab => tab.isFrame && !tab.deleteDate) || null;
  }
);

export const selectFocusTab = createSelector(
  [
    selectIdToTab,
  ],
  (idToTab: IdToType<Tab>) => {
    return Object.values(idToTab).find(tab => tab.isFocus && !tab.deleteDate) || null;
  }
);

export default authSlice.reducer;
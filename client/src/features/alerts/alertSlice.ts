import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../../app/store';
import { IdToType } from "../../types";
import { Alert } from "./alert";
import { setInit, setLogout } from "../auth/authSlice";

export interface AlertState {
  idToAlert: IdToType<Alert>;
}

const initialState: AlertState = {
  idToAlert: {},
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    mergeAlerts: (state, action: PayloadAction<Alert[]>) => {
      return {
        ...state,
        idToAlert: action.payload.reduce((acc, alert) => {
          acc[alert.id] = {
            ...acc[alert.id],
            ...alert
          };
          return acc;
        }, {
          ...state.idToAlert
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
      .addCase(setLogout, (state, action) => {
        return initialState;
      })
  }
});

export const {
  mergeAlerts,
} = alertSlice.actions;

export const selectIdToAlert = (state: RootState) => state.alert.idToAlert


export default alertSlice.reducer;
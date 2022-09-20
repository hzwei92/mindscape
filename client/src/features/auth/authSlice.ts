import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../user/user";
import type { RootState } from '../../app/store';

export interface AuthState {
  isInit: boolean;
  isValid: boolean;
  sessionId: string;
  interval: ReturnType<typeof setInterval> | null;
}

const initialState: AuthState = {
  isInit: false,
  isValid: false,
  sessionId: '',
  interval: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthIsInit: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isInit: action.payload,
      };
    },
    setAuthIsValid: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isValid: action.payload,
      };
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        sessionId: action.payload,
      };
    },
    setTokenInterval: (state, action: PayloadAction<ReturnType<typeof setInterval> | null>) => {
      return {
        ...state,
        interval: action.payload,
      }
    },
    setLogin: (state, action: PayloadAction<User>) => {
      return {
        ...state,
        isValid: true,
      };
    },
    setLogout: (state) => {
      return {
        ...state,
        isValid: false,
      };
    },
    setInit: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isInit: true,
        isValid: action.payload,
      }
    }
  },
});

export const {
  setAuthIsInit,
  setAuthIsValid,
  setSessionId,
  setTokenInterval,
  setInit,
  setLogin,
  setLogout,
} = authSlice.actions;

export const selectTokenInterval = (state: RootState) => state.auth.interval;
export const selectAuthIsInit = (state: RootState) => state.auth.isInit;
export const selectAuthIsValid = (state: RootState) => state.auth.isValid;
export const selectSessionId = (state: RootState) => state.auth.sessionId;

export default authSlice.reducer;
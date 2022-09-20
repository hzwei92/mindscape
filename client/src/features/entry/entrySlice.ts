import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToType } from '../../types';
import { setInit, setLogin, setLogout } from '../auth/authSlice';
import { Entry } from './entry';

export interface EntryState {
  idToEntry: IdToType<Entry>;
  newEntryId: string;
};

const initialState: EntryState = {
  idToEntry: {},
  newEntryId: '',
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState,
  reducers: {
    mergeEntries: (state, action: PayloadAction<IdToType<Entry>>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          ...action.payload,
        },
      }
    },
    addEntry: (state, action: PayloadAction<Entry>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          [action.payload.id]: action.payload,
        },
      };
    },
    updateEntry: (state, action: PayloadAction<Entry>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          [action.payload.id]: action.payload,
        },
      };
    },
    removeEntries: (state, action: PayloadAction<string[]>) => {
      const idToEntry = {
        ...state.idToEntry,
      };
      action.payload.forEach(entryId => {
        delete idToEntry[entryId];
      });
      return {
        ...state,
        idToEntry,
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
        return initialState;
      })
      .addCase(setLogout, () => {
        return initialState;
      })
  }
});

export const {
  mergeEntries,
  addEntry,
  updateEntry,
  removeEntries,
} = entrySlice.actions;

export const selectIdToEntry = (state: RootState) => state.entry.idToEntry;
export const selectNewEntryId = (state: RootState) => state.entry.newEntryId;

export default entrySlice.reducer
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { setInit, setLogin, setLogout } from '../auth/authSlice';
import { SearchSlice } from './search';

export interface SearchState {
  stack: SearchSlice[];
  index: number;
  shouldRefreshDraft: boolean;
}

const initialState: SearchState = {
  stack: [{
    originalQuery: '',
    query: '',
    entryIds: [],
    userIds: [],
  }],
  index: 0,
  shouldRefreshDraft: false,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchGoBack: (state) => {
      const stack = [...state.stack];
      const query = stack[state.index - 1].originalQuery;
      stack.splice(state.index - 1, 1, {
        ...stack[state.index - 1],
        query,
      });
      return {
        ...state,
        stack,
        index: state.index - 1,
      };
    },
    searchGoForward: (state) => {
      const stack = [...state.stack];
      const query = stack[state.index + 1].originalQuery;
      stack.splice(state.index + 1, 1, {
        ...stack[state.index + 1],
        query,
      });
      return {
        ...state,
        stack,
        index: state.index + 1,
      };
    },
    searchPushSlice: (state, action: PayloadAction<SearchSlice>) => {
      const stack = state.stack.slice(0, state.index + 1);
      stack.push(action.payload);
      return {
        ...state,
        stack,
        index: state.index + 1,
      };
    },
    searchSpliceSlice: (state, action: PayloadAction<SearchSlice>) => {
      const stack = [...state.stack];
      stack.splice(state.index, 1, action.payload);
      return {
        ...state, 
        stack,
      };
    },
    searchRefresh: (state, action: PayloadAction<boolean>) => {
      return {
        ...state, 
        shouldRefreshDraft: action.payload,
      }
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
  searchGoBack,
  searchGoForward,
  searchPushSlice,
  searchSpliceSlice,
  searchRefresh,
} = searchSlice.actions;

export const selectSearchStack = (state: RootState) => state.search.stack;
export const selectSearchIndex = (state: RootState) => state.search.index;
export const selectSearchShouldRefresh = (state: RootState) => state.search.shouldRefreshDraft;

export const selectSearchSlice = createSelector(
  selectSearchStack,
  selectSearchIndex,
  (stack, index) => stack[index],
);

export default searchSlice.reducer
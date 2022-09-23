import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { SpaceType } from '../space/space';
import { Cursor, IdToCursorType } from './cursor';

export interface CursorState {
  [SpaceType.FRAME]: {
    idToCursor: IdToCursorType
  },
  [SpaceType.FOCUS]: {
    idToCursor: IdToCursorType
  },
}

const initialState: CursorState = {
  [SpaceType.FRAME]: {
    idToCursor: {},
  },
  [SpaceType.FOCUS]: {
    idToCursor: {},
  }
};

export const cursorSlice = createSlice({
  name: 'cursor',
  initialState,
  reducers: {
    addCursor: (state, action: PayloadAction<{space: SpaceType, cursor: Cursor}>) => {
      return {
        ...state,
        [action.payload.space]: {
          idToCursor: {
            ...state[action.payload.space].idToCursor,
            [action.payload.cursor.id]: action.payload.cursor,
          }
        }
      }
    },
    removeCursor: (state, action: PayloadAction<{space: SpaceType, id: string}>) => {
      const idToCursor = {
        ...state[action.payload.space].idToCursor,
      };
      delete idToCursor[action.payload.id];
      return {
        ...state,
        [action.payload.space]: {
          idToCursor,
        },
      };
    },
    resetCursors: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          idToCursor: {},
        },
      };
    },
  },
});

export const {
  addCursor,
  removeCursor,
  resetCursors,
} = cursorSlice.actions;

export const selectIdToCursor = (space: SpaceType) => (state: RootState) => state.cursor[space].idToCursor;

export default cursorSlice.reducer
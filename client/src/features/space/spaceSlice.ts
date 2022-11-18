import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToType } from '../../types';
import { DragState, PosType, ScrollState, SpaceType } from '../space/space';

export interface SpaceState {
  selectedSpace: SpaceType;
  [SpaceType.FRAME]: {
    selectedTwigId: string;
    scale: number;
    scroll: ScrollState;
    cursor: PosType;
    drag: DragState;
    idToPos: IdToType<PosType>;
    idToHeight: IdToType<number>;
  };
  [SpaceType.FOCUS]: {
    selectedTwigId: string;
    scale: number;
    scroll: ScrollState;
    cursor: PosType;
    drag: DragState;
    idToPos: IdToType<PosType>;
    idToHeight: IdToType<number>;
  }
}

const initialState: SpaceState = {
  selectedSpace: SpaceType.FRAME,
  [SpaceType.FRAME]: {
    selectedTwigId: '',
    scale: 1,
    scroll: {
      left: 0,
      top: 0,
    },
    cursor: {
      x: 0,
      y: 0,
    },
    drag: {
      isScreen: false,
      twigId: '',
      targetTwigId: '',
    },
    idToPos: {},
    idToHeight: {},
  },
  [SpaceType.FOCUS]: {
    selectedTwigId: '',
    scale: 1,
    scroll: {
      left: 0,
      top: 0,
    },
    cursor: {
      x: 0,
      y: 0,
    },
    drag: {
      isScreen: false,
      twigId: '',
      targetTwigId: '',
    },
    idToPos: {},
    idToHeight: {},
  },
};

export const spaceSlice = createSlice({
  name: 'frame',
  initialState,
  reducers: {
    setSelectedSpace: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        selectedSpace: action.payload,
      }
    },
    setSelectedTwigId: (state, action: PayloadAction<{space: SpaceType, selectedTwigId: string}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          selectedTwigId: action.payload.selectedTwigId,
        },
      };
    },
    setScale: (state, action: PayloadAction<{space: SpaceType, scale: number}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          scale: action.payload.scale,
        },
      };
    },
    setScroll: (state, action: PayloadAction<{space: SpaceType, scroll: ScrollState}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          scroll: action.payload.scroll,
        },
      };
    },
    setCursor: (state, action: PayloadAction<{space: SpaceType, cursor: PosType}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          cursor: action.payload.cursor,
        },
      };
    },
    setDrag: (state, action: PayloadAction<{space: SpaceType, drag: DragState}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          drag: action.payload.drag,
        },
      };
    },
    mergeIdToPos: (state, action: PayloadAction<{space: SpaceType, idToPos: IdToType<PosType>}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToPos: {
            ...state[action.payload.space].idToPos,
            ...action.payload.idToPos,
          },
        },
      };
    },
    moveTwigs: (state, action: PayloadAction<{space: SpaceType, twigIds: string[], dx: number, dy: number}>) => {
      const idToPos = action.payload.twigIds.reduce((acc: IdToType<PosType>, twigId: string) => {
        acc[twigId] = {
          x: Math.round(acc[twigId].x + action.payload.dx),
          y: Math.round(acc[twigId].y + action.payload.dy),
        };
        return acc;
      }, {  ...state[action.payload.space].idToPos });
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToPos,
        },
      }
    },
    mergeIdToHeight: (state, action: PayloadAction<{space: SpaceType, idToHeight: IdToType<number>}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToHeight: {
            ...state[action.payload.space].idToHeight,
            ...action.payload.idToHeight,
          }
        },
      };
    },
    resetSpace: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          ...initialState[action.payload],
        },
      };
    },
  },
});

export const {
  setSelectedSpace,
  setSelectedTwigId,
  setScale,
  setScroll,
  setCursor,
  setDrag,
  mergeIdToPos,
  moveTwigs,
  mergeIdToHeight,
  resetSpace,
} = spaceSlice.actions;

export const selectSelectedSpace = (state: RootState) => state.space.selectedSpace;
export const selectSelectedTwigId = (space: SpaceType) => (state: RootState) => state.space[space].selectedTwigId;
export const selectScale = (space: SpaceType) => (state: RootState) => state.space[space].scale;
export const selectScroll = (space: SpaceType) => (state: RootState) => state.space[space].scroll;
export const selectCursor = (space: SpaceType) => (state: RootState) => state.space[space].cursor;
export const selectDrag = (space: SpaceType) => (state: RootState) => state.space[space].drag;
export const selectIdToPos = (space: SpaceType) => (state: RootState) => state.space[space].idToPos;
export const selectIdToHeight = (space: SpaceType) => (state: RootState) => state.space[space].idToHeight;

export const selectHeightByTwigId = createSelector(
  [
    (state: RootState, space: SpaceType, twigId: string) => selectIdToHeight(space)(state),
    (state, space, twigId) => twigId,
  ],
  (idToHeight, twigId): number => idToHeight[twigId],
)

export default spaceSlice.reducer
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IdToType } from "../../types";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { SpaceType } from "../space/space";
import type { CopyingTwigType, Twig } from "./twig";

export interface TwigState {
  newTwigId: string;
  [SpaceType.FRAME]: {
    idToTwig: IdToType<Twig>;
    iToTwigId: IdToType<string>;
    shouldReloadTwigTree: boolean;
    idToChildIdToTrue: IdToType<IdToType<true>>;
    idToDescIdToTrue: IdToType<IdToType<true>>;
  };
  [SpaceType.FOCUS]: {
    idToTwig: IdToType<Twig>;
    iToTwigId: IdToType<string>;
    shouldReloadTwigTree: boolean;
    idToChildIdToTrue: IdToType<IdToType<true>>;
    idToDescIdToTrue: IdToType<IdToType<true>>;
  };
};

const initialState: TwigState = {
  newTwigId: '',
  [SpaceType.FRAME]: {
    idToTwig: {},
    iToTwigId: {},
    shouldReloadTwigTree: false,
    idToChildIdToTrue: {},
    idToDescIdToTrue: {},
  },
  [SpaceType.FOCUS]: {
    idToTwig: {},
    iToTwigId: {},
    shouldReloadTwigTree: false,
    idToChildIdToTrue: {},
    idToDescIdToTrue: {},
  },
}


const twigSlice = createSlice({
  name: 'twig',
  initialState,
  reducers: {
    mergeTwigs: (state, action: PayloadAction<{space: SpaceType, twigs: Twig[]}>) => {
      const {
        idToTwig,
        iToTwigId,
      } = action.payload.twigs.reduce((acc, twig) => {
        if (!twig?.id) return acc;
 
        if (twig.deleteDate) {
          delete acc.idToTwig[twig.id];
          delete acc.iToTwigId[twig.i];
        }
        else {
          acc.idToTwig[twig.id] = Object.assign({}, acc.idToTwig[twig.id], twig);
          acc.iToTwigId[twig.i] = twig.id;
        }
        return acc;
      }, {
        idToTwig: { ...state[action.payload.space].idToTwig },
        iToTwigId: { ...state[action.payload.space].iToTwigId },
      });

      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToTwig,
          iToTwigId,
          shouldReloadTwigTree: true,
        }
      };
    },
    setShouldReloadTwigTree: (state, action: PayloadAction<{space: SpaceType, shouldReload: boolean}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          shouldReloadTwigTree: action.payload.shouldReload,
        }
      }
    },
    setTwigTree: (state, action: PayloadAction<{
      space: SpaceType, 
      idToChildIdToTrue: IdToType<IdToType<true>>, 
      idToDescIdToTrue: IdToType<IdToType<true>>
    }>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          shouldReloadTwigTree: false,
          idToChildIdToTrue: action.payload.idToChildIdToTrue,
          idToDescIdToTrue: action.payload.idToDescIdToTrue,
        },
      }
    },
    setNewTwigId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        newTwigId: action.payload,
      }
    },
    resetTwigs: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          idToTwig: {},
          iToTwigId: {},
          idToChildIdToTrue: {},
          idToDescIdToTrue: {},
        }
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
      .addCase(setLogin, () => {
        return initialState;
      })
      .addCase(setLogout, () => {
        return initialState;
      })
  }
});

export const { 
  mergeTwigs, 
  resetTwigs,
  setShouldReloadTwigTree,
  setTwigTree,
  setNewTwigId,
} = twigSlice.actions;

export const selectNewTwigId = (state: RootState) => state.twig.newTwigId;
export const selectIdToTwig = (space: SpaceType) => (state: RootState) => state.twig[space].idToTwig;
export const selectIToTwigId = (space: SpaceType) => (state: RootState) => state.twig[space].iToTwigId;
export const selectShouldReloadTwigTree = (space: SpaceType) => (state: RootState) => state.twig[space].shouldReloadTwigTree;
export const selectIdToChildIdToTrue = (space: SpaceType) => (state: RootState) => state.twig[space].idToChildIdToTrue;
export const selectIdToDescIdToTrue = (space: SpaceType) => (state: RootState) => state.twig[space].idToDescIdToTrue;

export const selectTwigById = createSelector(
  [
    (state, space, twigId) => selectIdToTwig(space)(state),
    (state, space, twigId) => twigId,
  ],
  (idToTwig, twigId): Twig => idToTwig[twigId]
)
export const selectChildIdToTrue = createSelector(
  [
    (state, space, twigId) => selectIdToChildIdToTrue(space)(state),
    (state, space, twigId) => twigId,
  ],
  (idToChildIdToTrue, twigId) => idToChildIdToTrue[twigId],
);

export default twigSlice.reducer;
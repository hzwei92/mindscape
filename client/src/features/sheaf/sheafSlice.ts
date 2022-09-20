import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IdToType } from "../../types";
import { mergeArrows } from "../arrow/arrowSlice";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeTwigs } from "../twig/twigSlice";
import { setCurrentUser } from "../user/userSlice";
import type { Sheaf } from "./sheaf";

export interface SheafState {
  idToSheaf: IdToType<Sheaf>;
  urlToSheafId: IdToType<string>;
};

const initialState: SheafState = {
  idToSheaf: {},
  urlToSheafId: {},
};

const sheafSlice = createSlice({
  name: 'sheaf',
  initialState,
  reducers: {
    mergeSheafs: (state, action: PayloadAction<Sheaf[]>) => {
      return action.payload.reduce((acc, sheaf) => {
        if (sheaf?.id) {
          acc.idToSheaf[sheaf.id] = sheaf;

          if (sheaf.url) {
            acc.urlToSheafId[sheaf.url] = sheaf.id
          }
        } 
        return acc;
      }, {
        idToSheaf: { ...state.idToSheaf },
        urlToSheafId: { ...state.urlToSheafId },
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setInit, (state, action) => {
        if (!action.payload) {
          return initialState;
        }
      })
      // .addCase(setLogin, (state, action) => {
      //   return [action.payload.frame?.sheaf, action.payload.focus?.sheaf].reduce((acc, sheaf) => {
      //     if (sheaf?.id) {
      //       acc.idToSheaf[sheaf.id] = sheaf;

      //       if (sheaf.url) {
      //         acc.urlToSheafId[sheaf.url] = sheaf.id
      //       }
      //     } 
      //     return acc;
      //   }, {
      //     idToSheaf: {} as IdToType<Sheaf>,
      //     urlToSheafId: {} as IdToType<string>,
      //   });
      // })
      .addCase(setLogout, () => {
        return initialState;
      })
      // .addCase(setCurrentUser, (state, action) => {
      //   return [action.payload?.frame, action.payload?.focus].reduce((acc, arrow) => {
      //     if (arrow?.sheaf) {
      //       acc.idToSheaf[arrow.sheaf.id] = arrow.sheaf;
            
      //       if (arrow.sheaf.url) {
      //         acc.urlToSheafId[arrow.sheaf.url] = arrow.sheaf.id
      //       }
      //     } 
      //     return acc;
      //   }, {
      //     idToSheaf: { ...state.idToSheaf },
      //     urlToSheafId: { ...state.urlToSheafId },
      //   });
      // })
      .addCase(mergeTwigs, (state, action) => {
        return action.payload.twigs.reduce((acc, twig) => {
          const arrow = twig.detail;
          if (arrow && !arrow.deleteDate && arrow.sheaf) {
            acc.idToSheaf[arrow.sheaf.id] = Object.assign({}, 
              acc.idToSheaf[arrow.sheaf.id], 
              arrow.sheaf
            );
            if (arrow.sheaf.url) {
              acc.urlToSheafId[arrow.sheaf.url] = arrow.sheaf.id;
            }
          }
          return acc;
        }, {
          idToSheaf: { ...state.idToSheaf },
          urlToSheafId: { ...state.urlToSheafId },
        });
      })
      .addCase(mergeArrows, (state, action) => {
        return action.payload.reduce((acc, arrow) => {
          if (arrow && !arrow.deleteDate && arrow.sheaf) {
            acc.idToSheaf[arrow.sheaf.id] = Object.assign({}, 
              acc.idToSheaf[arrow.sheaf.id], 
              arrow.sheaf
            );
            if (arrow.sheaf.url) {
              acc.urlToSheafId[arrow.sheaf.url] = arrow.sheaf.id;
            }
          }
          return acc;
        }, {
          idToSheaf: { ...state.idToSheaf },
          urlToSheafId: { ...state.urlToSheafId },
        })
        
      })
  }
});

export const { mergeSheafs } = sheafSlice.actions;
export const selectIdToSheaf = (state: RootState) => state.sheaf.idToSheaf;
export const selectUrlToSheafId = (state: RootState) => state.sheaf.urlToSheafId;

export const selectSheafById = createSelector(
  [
    selectIdToSheaf,
    (state, id: string | null | undefined) => id,
  ],
  (idToSheaf, id) => {
    if (id) {
      return idToSheaf[id];
    }
    return null;
  },
);

export default sheafSlice.reducer;
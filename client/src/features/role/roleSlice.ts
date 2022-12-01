import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../../app/store';
import { IdToType } from "../../types";
import { Role } from "./role";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeArrows } from "../arrow/arrowSlice";
import { mergeTwigs } from "../space/spaceSlice";
import { mergeTabs } from "../tab/tabSlice";

export interface RoleState {
  idToRole: IdToType<Role>;
}

const initialState: RoleState = {
  idToRole: {},
};

const authSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    mergeRoles: (state, action: PayloadAction<Role[]>) => {
      return {
        ...state,
        idToRole: action.payload.reduce((acc, role) => {
          acc[role.id] = {
            ...acc[role.id],
            ...role
          };
          return acc;
        }, {
          ...state.idToRole
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
      .addCase(mergeTabs, (state, action) => {
        return {
          ...state,
          idToRole: action.payload.reduce((acc, tab) => {
            (tab.arrow.roles || []).forEach(role => {
              acc[role.id] = {
                ...acc[role.id],
                ...role
              };
            });
            return acc;
          }, {
            ...state.idToRole
          }),
        };
      })
      .addCase(mergeTwigs, (state, action) => {
        const idToRole = action.payload.twigs.reduce((acc, twig) => {
          if (twig?.detail?.currentUserRole) {
            acc[twig.detail.currentUserRole.id] = {
              ...acc[twig.detail.currentUserRole.id],
              ...twig.detail.currentUserRole
            };
          }
          return acc;
        }, {
          ...state.idToRole
        });

        return {
          ...state,
          idToRole,
        };
      })
      .addCase(mergeArrows, (state, action) => {
        const idToRole = action.payload.reduce((acc, arrow) => {
          if (arrow?.currentUserRole) {
            acc[arrow.currentUserRole.id] = {
              ...acc[arrow.currentUserRole.id],
              ...arrow.currentUserRole
            };
          }
          return acc;
        }, {
          ...state.idToRole
        });

        return {
          ...state,
          idToRole,
        };
      })
      .addCase(setLogin, (state, action) => {
        const idToRole = (action.payload?.tabs || []).reduce((acc, tab) => {
          (tab.arrow.roles || []).forEach(role => {
            acc[role.id] = {
              ...acc[role.id],
              ...role
            };
          });
          return acc;
        }, { ...state.idToRole });
        return {
          ...state,
          idToRole: {
            ...state.idToRole,
            ...idToRole,
          },
        };
      });
  }
});

export const {
  mergeRoles,
} = authSlice.actions;

export const selectIdToRole = (state: RootState) => state.role.idToRole

export const selectRoleByUserIdAndArrowId = createSelector(
  [
    selectIdToRole,
    (state: RootState, userId?: string, arrowId?: string) => userId,
    (state: RootState, userId?: string, arrowId?: string) => arrowId,
  ],
  (idToRole, userId, arrowId) => {
    return Object.values(idToRole).find(role => 
      role.userId === userId && role.arrowId === arrowId
    ) || null;
  }
)


export default authSlice.reducer;
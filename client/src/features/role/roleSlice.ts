import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../../app/store';
import { IdToType } from "../../types";
import { Role } from "./role";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { setCurrentUser } from "../user/userSlice";

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
      .addCase(setLogin, (state, action) => {
        const idToRole = action.payload.roles.reduce((acc: IdToType<Role>, role) => {
          acc[role.id] = role;
          return acc;
        }, {});
        return {
          ...state,
          idToRole,
        };
      })
      .addCase(setLogout, (state, action) => {
        return initialState;
      })
      .addCase(setCurrentUser, (state, action) => {
        const idToRole = (action.payload?.roles || []).reduce((acc: IdToType<Role>, role) => {
          acc[role.id] = role;
          return acc;
        }, {});
        return {
          ...state,
          idToRole,
        };
      })
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
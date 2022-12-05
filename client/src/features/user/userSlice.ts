import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import type { IdToType } from '../../types';
import { mergeArrows } from '../arrow/arrowSlice';
import { setInit, setLogin, setLogout } from '../auth/authSlice';
import { mergeLeads } from '../lead/leadSlice';
import { addAvatar, mergeTwigs } from '../space/spaceSlice';
import type { User } from './user';

export interface UserState {
  currentUserId: string;
  idToUser: IdToType<User>;
}

const initialState: UserState = {
  currentUserId: '',
  idToUser: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    mergeUsers: (state, action: PayloadAction<User[]>) => {
      const idToUser = action.payload.reduce((acc, user) => {
        acc[user.id] = {
          ...acc[user.id],
          ...user,
        };
        return acc;
      }, { ...state.idToUser });

      return {
        ...state,
        idToUser,
      };
    },
    resetUsers: (state) => {
      return {
        ...state,
        idToUser: initialState.idToUser,
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
        return {
          currentUserId: action.payload.id,
          idToUser: {
            [action.payload.id]: action.payload,
          },
        };
      })
      .addCase(setLogout, () => {
        return initialState;
      })
      .addCase(mergeTwigs, (state, action) => {
        const idToUser = action.payload.twigs.reduce((acc, twig) => {
          if (!twig.deleteDate) {
            acc[twig.userId] = {
              ...acc[twig.userId],
              ...twig.user,
            };

            if (twig.detail) {
              acc[twig.detail.userId] = {
                ...acc[twig.detail.userId],
                ...twig.detail.user,
              };
            }
          }
          return acc;
        }, { ...state.idToUser });

        return {
          ...state,
          idToUser,
        };
      })
      .addCase(mergeArrows, (state, action) => {
        const idToUser = action.payload.reduce((acc, arrow) => {
          if (!arrow.deleteDate) {
            acc[arrow.userId] = {
              ...acc[arrow.userId],
              ...arrow.user,
            };
          }
          return acc;
        }, { ...state.idToUser });

        return {
          ...state,
          idToUser,
        };
      })
      .addCase(mergeLeads, (state, action) => {
        const idToUser = action.payload.reduce((acc, lead) => {
          if (lead.leader) {
            acc[lead.leaderId] = {
              ...acc[lead.leaderId],
              ...lead.leader,
            };
          }
          if (lead.follower) {
            acc[lead.followerId] = {
              ...acc[lead.followerId],
              ...lead.follower,
            };
          }
          return acc;
        }, { ...state.idToUser });

        return {
          ...state,
          idToUser,
        };
      })
      .addCase(addAvatar, (state, action) => {
        const {id, activeDate} = action.payload.avatar;

        const idToUser = {
          ...state.idToUser,
          [id]: {
            ...state.idToUser[id],
            activeDate,
          },
        };

        return {
          ...state,
          idToUser,
        };
      });
  },
});

export const {
  mergeUsers,
  resetUsers,
} = userSlice.actions;

export const selectIdToUser = (state: RootState) => state.user.idToUser;

export const selectUserById = createSelector(
  [
    (state: RootState, id: string | undefined) => id,
    (state: RootState, id: string | undefined) => selectIdToUser(state),
  ],
  (id, idToUser): User | null => id ? idToUser[id] || null : null,
);

export const selectCurrentUser = createSelector(
  [
    (state: RootState) => state.user.currentUserId,
    selectIdToUser,
  ],
  (id, idToUser) => idToUser[id],
);

export default userSlice.reducer
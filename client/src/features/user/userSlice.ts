import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import type { IdToType } from '../../types';
import { mergeArrows } from '../arrow/arrowSlice';
import { setInit, setLogin, setLogout } from '../auth/authSlice';
import { SpaceType } from '../space/space';
import { mergeTwigs } from '../twig/twigSlice';
import type { User } from './user';

export interface UserState {
  currentUser: User | null;
  idToUser: IdToType<User>;
}

const initialState: UserState = {
  currentUser: null,
  idToUser: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      const idToUser = { ...state.idToUser };
      if (action.payload) {
        idToUser[action.payload.id] = action.payload;
      }
      return {
        ...state,
        currentUser: action.payload,
        idToUser,
      }
    },
    mergeUsers: (state, action: PayloadAction<User[]>) => {
      const idToUser = { ...state.idToUser };
      let currentUser = state.currentUser
        ? { ...state.currentUser }
        : null;
      action.payload.forEach(user => {
        if (user.id === state.currentUser?.id) {
          currentUser = {
            ...currentUser,
            ...user,
          }
        }
        idToUser[user.id] = {
          ...idToUser[user.id],
          ...user,
        };
      });
      return {
        ...state,
        currentUser,
        idToUser,
      };
    },
    resetUsers: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          idToUser: {},
        }
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
          ...initialState,
          currentUser: action.payload,
        };
      })
      .addCase(setLogout, () => {
        return initialState;
      })
      .addCase(mergeTwigs, (state, action) => {
        const idToUser = action.payload.twigs.reduce((acc, twig) => {
          if (!twig.deleteDate) {
            acc[twig.userId] = Object.assign({}, 
              acc[twig.userId], 
              twig.user
            );
            if (twig.detail) {
              acc[twig.detail.userId] = Object.assign({}, 
                acc[twig.detail.userId], 
                twig.detail.user
              );
            }
          }
          return acc;
        }, { 
          ...state.idToUser
        });

        return {
          ...state,
          idToUser,
        };
      })
      .addCase(mergeArrows, (state, action) => {
        const idToUser = action.payload.reduce((acc, arrow) => {
          if (!arrow.deleteDate) {
            acc[arrow.userId] = Object.assign({}, 
              acc[arrow.userId], 
              arrow.user
            );
          }
          return acc;
        }, { 
          ...state.idToUser
        });

        return {
          ...state,
          idToUser,
        };
      })
  },
});

export const {
  setCurrentUser,
  mergeUsers,
  resetUsers,
} = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectIdToUser = (state: RootState) => state.user.idToUser;

export const selectUserById = createSelector(
  [
    (state: RootState, id: string | undefined) => id,
    (state: RootState, id: string | undefined) => selectIdToUser(state),
  ],
  (id, idToUser): User | null => id ? idToUser[id] || null : null,
);

export default userSlice.reducer
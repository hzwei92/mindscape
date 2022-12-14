import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { VIEW_RADIUS } from '../../constants';
import { IdToType } from '../../types';
import { setLogin, setLogout } from '../auth/authSlice';
import { Role } from '../role/role';
import { AvatarType, DragState, PosType, ScrollState, SpaceData } from '../space/space';
import { mergeTabs } from '../tab/tabSlice';
import { Twig } from '../twig/twig';

export interface SpaceState {
  cursor: PosType;
  drag: DragState;
  abstractIdToData: IdToType<SpaceData>;
};

const initialState: SpaceState = {
  cursor: {
    x: 0,
    y: 0,
  },
  drag: {
    isScreen: false,
    twigId: '',
    targetTwigId: '',
  },
  abstractIdToData: {
    '': {
      selectedTwigId: '',
      idToPos: {},
      idToHeight: {},
      idToTwig: {},
      iToTwigId: {},
      shouldReloadTwigTree: false,
      idToChildIdToTrue: {},
      idToDescIdToTrue: {},
      idToAvatar: {},
      idToRole: {},
    }
  },
};

export const spaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {
    setSelectedTwigId: (state, action: PayloadAction<{abstractId: string, twigId: string}>) => {
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            selectedTwigId: action.payload.twigId,
          },
        }
      };
    },
    setCursor: (state, action: PayloadAction<PosType>) => {
      return {
        ...state,
        cursor: action.payload,
      };
    },
    setDrag: (state, action: PayloadAction<DragState>) => {
      return {
        ...state,
       drag: action.payload,
      };
    },
    mergeTwigs: (state, action: PayloadAction<{abstractId: string, twigs: Twig[]}>) => {
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
          acc.idToTwig[twig.id] = {
            ...acc.idToTwig[twig.id], 
            ...twig,
          };
          acc.iToTwigId[twig.i] = twig.id;
        }
        return acc;
      }, {
        idToTwig: { ...state.abstractIdToData[action.payload.abstractId]?.idToTwig },
        iToTwigId: { ...state.abstractIdToData[action.payload.abstractId]?.iToTwigId },
      });

      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToTwig,
            iToTwigId,
            shouldReloadTwigTree: true,
          },
        },
      };
    },
    setTwigTree: (state, action: PayloadAction<{
      abstractId: string, 
      idToChildIdToTrue: IdToType<IdToType<true>>, 
      idToDescIdToTrue: IdToType<IdToType<true>>
    }>) => {
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            shouldReloadTwigTree: false,
            idToChildIdToTrue: action.payload.idToChildIdToTrue,
            idToDescIdToTrue: action.payload.idToDescIdToTrue,
          },
        }
      }
    },
    mergeIdToPos: (state, action: PayloadAction<{abstractId: string, idToPos: IdToType<PosType>}>) => {
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToPos: {
              ...state.abstractIdToData[action.payload.abstractId].idToPos,
              ...action.payload.idToPos,
            },
          },
        }
      };
    },
    moveTwigs: (state, action: PayloadAction<{abstractId: string, twigIds: string[], dx: number, dy: number}>) => {
      const idToPos = action.payload.twigIds.reduce((acc: IdToType<PosType>, twigId: string) => {
        acc[twigId] = {
          x: Math.min(VIEW_RADIUS, Math.max(-1 * VIEW_RADIUS, Math.round(acc[twigId].x + action.payload.dx))),
          y: Math.min(VIEW_RADIUS, Math.max(-1 * VIEW_RADIUS, Math.round(acc[twigId].y + action.payload.dy))),
        };
        return acc;
      }, {  ...state.abstractIdToData[action.payload.abstractId].idToPos });
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToPos,
          },
        },
      }
    },
    mergeIdToHeight: (state, action: PayloadAction<{abstractId: string, idToHeight: IdToType<number>}>) => {
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToHeight: {
              ...state.abstractIdToData[action.payload.abstractId].idToHeight,
              ...action.payload.idToHeight,
            }
          },
        }

      };
    },
    addAvatar: (state, action: PayloadAction<{abstractId: string, avatar: AvatarType}>) => {
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToAvatar: {
              ...state.abstractIdToData[action.payload.abstractId].idToAvatar,
              [action.payload.avatar.id]: action.payload.avatar,
            }
          }
        }
      }
    },
    removeAvatar: (state, action: PayloadAction<{abstractId: string, id: string}>) => {
      const idToAvatar = { ...state.abstractIdToData[action.payload.abstractId].idToAvatar };
      delete idToAvatar[action.payload.id];
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToAvatar,
          },
        }
      };
    },
    resetSpace: (state, action: PayloadAction<string>) => {
      const abstractIdToData = { ...state.abstractIdToData };
      delete abstractIdToData[action.payload];
      return {
        ...state,
        abstractIdToData,
      };
    },
    mergeRoles: (state, action: PayloadAction<{abstractId: string, roles: Role[]}>) => {
      const idToRole = action.payload.roles.reduce((acc, role) => {
        acc[role.id] = role;
        return acc;
      }, { ...state.abstractIdToData[action.payload.abstractId].idToRole });
      return {
        ...state,
        abstractIdToData: {
          ...state.abstractIdToData,
          [action.payload.abstractId]: {
            ...state.abstractIdToData[action.payload.abstractId],
            idToRole,
          },
        }
      };
    },
  },
  extraReducers: builder => {
    builder
    .addCase(mergeTabs, (state, action) => {
      const abstractIdToData = (action.payload || []).reduce((acc, tab) => {
        if (tab.arrowId && !acc[tab?.arrowId]) {
          acc[tab.arrowId] = {
            selectedTwigId: '',
            idToPos: {},
            idToHeight: {},
            idToTwig: {},
            iToTwigId: {},
            shouldReloadTwigTree: false,
            idToChildIdToTrue: {},
            idToDescIdToTrue: {},
            idToAvatar: {},
            idToRole: (tab.arrow.roles || []).reduce((acc, role) => {
              acc[role.id] = role;
              return acc;
            }, {} as IdToType<Role>),
          };
        }
        return acc;
      }, { ...state.abstractIdToData });
      return {
        ...state, 
        abstractIdToData,
      }
    })
    .addCase(setLogin, (state, action) => {
      const abstractIdToData = (action.payload?.tabs || []).reduce((acc: IdToType<SpaceData>, tab) => {
        if (tab.arrowId) {
          acc[tab.arrowId] = {
            selectedTwigId: '',
            idToPos: {},
            idToHeight: {},
            idToTwig: {},
            iToTwigId: {},
            shouldReloadTwigTree: false,
            idToChildIdToTrue: {},
            idToDescIdToTrue: {},
            idToAvatar: {},
            idToRole: (tab.arrow.roles || []).reduce((acc: IdToType<Role>, role) => {
              acc[role.id] = role;
              return acc;
            }, {}),
          };
        }
        return acc;
      }, { ... state.abstractIdToData });
      return {
        ...state,
        abstractIdToData,
      };
    })
    .addCase(setLogout, (state, action) => {
      return initialState;
    })
  },
});

export const {
  setSelectedTwigId,
  setCursor,
  setDrag,
  mergeTwigs,
  setTwigTree,
  mergeIdToPos,
  moveTwigs,
  mergeIdToHeight,
  addAvatar,
  removeAvatar,
  resetSpace,
  mergeRoles,
} = spaceSlice.actions;

export const selectCursor = (state: RootState) => state.space.cursor;
export const selectDrag = (state: RootState) => state.space.drag;

export const selectAbstractIdToData = (state: RootState) => state.space.abstractIdToData;
export const selectSpaceData = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId];

export const selectSelectedTwigId = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.selectedTwigId;

export const selectIdToTwig = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToTwig;
export const selectIToTwigId = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.iToTwigId;
export const selectShouldReloadTwigTree = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.shouldReloadTwigTree;
export const selectIdToChildIdToTrue = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToChildIdToTrue;
export const selectIdToDescIdToTrue = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToDescIdToTrue;
export const selectIdToPos = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToPos;
export const selectIdToHeight = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToHeight;
export const selectIdToRole = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToRole;

export const selectIdToAvatar = (abstractId: string) => (state: RootState) => state.space.abstractIdToData[abstractId]?.idToAvatar;

export const selectHeightByTwigId = createSelector(
  [
    (state: RootState, abstractId: string, twigId: string) => selectIdToHeight(abstractId)(state),
    (state, abstractId, twigId) => twigId,
  ],
  (idToHeight, twigId): number => (idToHeight ?? {})[twigId] ?? 0,
);

export const selectTwigById = createSelector(
  [
    (state: RootState, abstractId: string, twigId: string) => selectIdToTwig(abstractId)(state),
    (state, abstractId, twigId) => twigId,
  ],
  (idToTwig, twigId) => (idToTwig ?? {})[twigId] ?? null,
);

export default spaceSlice.reducer
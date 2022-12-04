import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../../app/store';
import { IdToType } from "../../types";
import { Lead } from "./lead";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeArrows } from "../arrow/arrowSlice";
import { mergeTwigs } from "../space/spaceSlice";
import { mergeTabs } from "../tab/tabSlice";
import { mergeUsers } from "../user/userSlice";

export interface LeadState {
  userId: string;
  idToLead: IdToType<Lead>;
  leaderIdToLeadId: IdToType<string>;
  followerIdToLeadId: IdToType<string>;
}

const initialState: LeadState = {
  userId: '',
  idToLead: {},
  leaderIdToLeadId: {},
  followerIdToLeadId: {},
};

const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    mergeLeads: (state, action: PayloadAction<Lead[]>) => {
      return action.payload.reduce((acc, lead) => {
        if (lead.deleteDate) {
          delete acc.idToLead[lead.id];
          delete acc.leaderIdToLeadId[lead.leaderId];
          delete acc.followerIdToLeadId[lead.followerId];
        }
        acc.idToLead[lead.id] = {
          ...acc.idToLead[lead.id],
          ...lead
        };
        if (lead.followerId === state.userId) {
          acc.leaderIdToLeadId[lead.leaderId] = lead.id;
        }
        if (lead.leaderId === state.userId) {
          acc.followerIdToLeadId[lead.followerId] = lead.id;
        }
        return acc;
      }, {
        ...state,
        idToLead: { ...state.idToLead },
        leaderIdToLeadId: { ...state.leaderIdToLeadId },
        followerIdToLeadId: { ...state.followerIdToLeadId },
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
      .addCase(setLogout, (state, action) => {
        return initialState;
      })
      .addCase(mergeUsers, (state, action) => {
        return action.payload.reduce((acc, user) => {
          if (user.currentUserLead) {
            const { currentUserLead } = user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          return acc;
        }, {
          ...state,
          idToLead: { ...state.idToLead },
          leaderIdToLeadId: { ...state.leaderIdToLeadId },
          followerIdToLeadId: { ...state.followerIdToLeadId },
        });
      })
      .addCase(mergeTabs, (state, action) => {
        return action.payload.reduce((acc, tab) => {
          if (tab.arrow?.user?.currentUserLead) {
            const { currentUserLead } = tab.arrow.user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          return acc;
        }, {
          ...state,
          idToLead: { ...state.idToLead },
          leaderIdToLeadId: { ...state.leaderIdToLeadId },
          followerIdToLeadId: { ...state.followerIdToLeadId },
        });
      })
      .addCase(mergeTwigs, (state, action) => {
        return action.payload.twigs.reduce((acc, twig) => {
          if (twig?.user?.currentUserLead) {
            const { currentUserLead } = twig.user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          if (twig?.detail?.user?.currentUserLead) {
            const { currentUserLead } = twig.detail.user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          return acc;
        }, {
          ...state,
          idToLead: { ...state.idToLead },
          leaderIdToLeadId: { ...state.leaderIdToLeadId },
          followerIdToLeadId: { ...state.followerIdToLeadId },
        });
      })
      .addCase(mergeArrows, (state, action) => {
        return action.payload.reduce((acc, arrow) => {
          if (arrow?.user?.currentUserLead) {
            const { currentUserLead } = arrow.user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          return acc;
        }, {
          ...state,
          idToLead: { ...state.idToLead },
          leaderIdToLeadId: { ...state.leaderIdToLeadId },
          followerIdToLeadId: { ...state.followerIdToLeadId },
        });
      })
      .addCase(setLogin, (state, action) => {
        return (action.payload.tabs || []).reduce((acc, tab) => {
          if (tab.arrow?.user?.currentUserLead) {
            const { currentUserLead } = tab.arrow.user;
            acc.idToLead[currentUserLead.id] = {
              ...acc.idToLead[currentUserLead.id],
              ...currentUserLead
            };
            acc.leaderIdToLeadId[currentUserLead.leaderId] = currentUserLead.id;
          }
          return acc;
        }, {
          ...state,
          userId: action.payload.id,
          idToLead: { ...state.idToLead },
          leaderIdToLeadId: { ...state.leaderIdToLeadId },
          followerIdToLeadId: { ...state.followerIdToLeadId },
        });
      });
  }
});

export const {
  mergeLeads,
} = leadSlice.actions;

export const selectIdToLead = (state: RootState) => state.lead.idToLead
export const selectLeaderIdToLeadId = (state: RootState) => state.lead.leaderIdToLeadId;
export const selectFollowerIdToLeadId = (state: RootState) => state.lead.followerIdToLeadId;


export default leadSlice.reducer;
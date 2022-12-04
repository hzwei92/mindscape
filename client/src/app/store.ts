import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import arrowSlice from '../features/arrow/arrowSlice';
import authSlice from '../features/auth/authSlice';
import entrySlice from '../features/entry/entrySlice';
import leadSlice from '../features/lead/leadSlice';
import roleSlice from '../features/role/roleSlice';
import searchSlice from '../features/search/searchSlice';
import sheafSlice from '../features/sheaf/sheafSlice';
import spaceSlice from '../features/space/spaceSlice';
import tabSlice from '../features/tab/tabSlice';
import userSlice from '../features/user/userSlice';
import voteSlice from '../features/vote/voteSlice';

export const store = configureStore({
  reducer: {
    arrow: arrowSlice,
    auth: authSlice,
    entry: entrySlice,
    lead: leadSlice,
    role: roleSlice,
    search: searchSlice,
    sheaf: sheafSlice,
    space: spaceSlice,
    tab: tabSlice,
    user: userSlice,
    vote: voteSlice,
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;



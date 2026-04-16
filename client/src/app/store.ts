import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api';
import authSlice from "../features/auth/authSlice";
import adminPermissionsSlice from "../features/admin/adminUIPermissionSlice" 

const store = configureStore({
  reducer: {
    auth: authSlice,
    adminPermissions: adminPermissionsSlice,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

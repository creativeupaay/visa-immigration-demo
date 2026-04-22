import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import { getAccessToken } from './tokenStore';

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: ["Tasks"],
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1",
    refreshUrl: '/auth/refresh-token',
    // Reads from the module-level tokenStore — avoids circular dep with store.ts
    getToken: getAccessToken,
  }),
  endpoints: () => ({}),
});
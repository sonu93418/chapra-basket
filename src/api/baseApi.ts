/**
 * Blink Box — RTK Query Base API
 * All API calls go through this single base with auth headers
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../constants';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Products', 'Cart', 'Orders', 'User', 'Addresses', 'Wishlist', 'Notifications', 'Banners'],
  endpoints: () => ({}),
});

export type { RootState };

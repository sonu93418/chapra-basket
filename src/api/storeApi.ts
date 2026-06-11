/**
 * Chapra Basket — Store Operations API (RTK Query)
 */
import { baseApi } from './baseApi';
import { Product } from '../types';

export interface Store {
  id: string;
  name: string;
  type: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  isOpen: boolean;
  ownerId?: string;
}

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Store[], void>({
      query: () => '/stores',
      providesTags: ['Products'],
      transformResponse: (res: { success: boolean; data: Store[] }) => res.data,
    }),

    updateStoreStatus: builder.mutation<Store, { id: string; isOpen: boolean }>({
      query: ({ id, isOpen }) => ({
        url: `/stores/${id}/status`,
        method: 'PATCH',
        body: { isOpen },
      }),
      invalidatesTags: ['Products'],
      transformResponse: (res: { success: boolean; data: Store }) => res.data,
    }),

    updateStoreProduct: builder.mutation<Product, { id: string; price?: number; mrp?: number; stockQuantity?: number; isActive?: boolean; name?: string }>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Products'],
      transformResponse: (res: { success: boolean; data: Product }) => res.data,
    }),
  }),
});

export const {
  useGetStoresQuery,
  useUpdateStoreStatusMutation,
  useUpdateStoreProductMutation,
} = storeApi;

/**
 * Blink Box — Addresses API (RTK Query)
 */
import { baseApi } from './baseApi';
import { ENDPOINTS } from '../constants';
import { Address } from '../types';

export const addressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => ENDPOINTS.ADDRESSES,
      providesTags: ['Addresses'],
      transformResponse: (res: { success: boolean; data: Address[] }) => res.data,
    }),

    getDefaultAddress: builder.query<Address, void>({
      query: () => `${ENDPOINTS.ADDRESSES}/default`,
      providesTags: ['Addresses'],
      transformResponse: (res: { success: boolean; data: Address }) => res.data,
    }),

    addAddress: builder.mutation<Address, Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (body) => ({ url: ENDPOINTS.ADDRESSES, method: 'POST', body }),
      invalidatesTags: ['Addresses'],
      transformResponse: (res: { success: boolean; data: Address }) => res.data,
    }),

    updateAddress: builder.mutation<Address, Partial<Address> & { id: string }>({
      query: ({ id, ...body }) => ({ url: ENDPOINTS.ADDRESS_BY_ID(id), method: 'PATCH', body }),
      invalidatesTags: ['Addresses'],
      transformResponse: (res: { success: boolean; data: Address }) => res.data,
    }),

    setDefaultAddress: builder.mutation<Address, string>({
      query: (id) => ({ url: `${ENDPOINTS.ADDRESSES}/default`, method: 'PATCH', body: { id } }),
      invalidatesTags: ['Addresses'],
      transformResponse: (res: { success: boolean; data: Address }) => res.data,
    }),

    deleteAddress: builder.mutation<{ success: boolean; data: { id: string; deleted: boolean } }, string>({
      query: (id) => ({ url: ENDPOINTS.ADDRESS_BY_ID(id), method: 'DELETE' }),
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetDefaultAddressQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;

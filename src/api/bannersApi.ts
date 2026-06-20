/**
 * Blink Box — Banners API (RTK Query)
 */
import { baseApi } from './baseApi';
import { Banner } from '../types';

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => '/banners',
      providesTags: ['Banners' as any],
      transformResponse: (res: { success: boolean; data: Banner[] }) => res.data,
    }),

    getAdminBanners: builder.query<Banner[], void>({
      query: () => '/banners/admin',
      providesTags: ['Banners' as any],
      transformResponse: (res: { success: boolean; data: Banner[] }) => res.data,
    }),

    createBanner: builder.mutation<Banner, Partial<Banner>>({
      query: (body) => ({
        url: '/banners',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Banners' as any],
      transformResponse: (res: { success: boolean; data: Banner }) => res.data,
    }),

    updateBanner: builder.mutation<Banner, { id: string } & Partial<Banner>>({
      query: ({ id, ...body }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Banners' as any],
      transformResponse: (res: { success: boolean; data: Banner }) => res.data,
    }),

    deleteBanner: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banners' as any],
      transformResponse: (res: { success: boolean; data: { id: string; deleted: boolean } }) => res.data,
    }),

    reorderBanners: builder.mutation<void, { reorders: { id: string; sortOrder: number }[] }>({
      query: (body) => ({
        url: '/banners/reorder',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Banners' as any],
    }),

    trackBannerClick: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banners/${id}/click`,
        method: 'POST',
      }),
      invalidatesTags: ['Banners' as any],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useReorderBannersMutation,
  useTrackBannerClickMutation,
} = bannersApi;

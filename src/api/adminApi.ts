/**
 * Chapra Basket — Admin Operations API (RTK Query)
 */
import { baseApi } from './baseApi';
import { User, UserRole } from '../types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<User[], void>({
      query: () => '/admin/users',
      providesTags: ['User'],
      transformResponse: (res: { success: boolean; data: User[] }) => res.data,
    }),

    updateUserRole: builder.mutation<User, { userId: string; role: UserRole }>({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
      transformResponse: (res: { success: boolean; data: User }) => res.data,
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useUpdateUserRoleMutation,
} = adminApi;

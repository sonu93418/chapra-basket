/**
 * Chapra Basket — Auth & Profile API (RTK Query)
 */
import { baseApi } from './baseApi';
import { ENDPOINTS } from '../constants';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: 'customer' | 'rider' | 'store_owner' | 'admin';
  referralCode: string;
  createdAt: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<{ success: boolean; data: { phone: string; expiresInSeconds: number; devOtp?: string } }, { phone: string }>({
      query: (body) => ({ url: ENDPOINTS.AUTH_SEND_OTP, method: 'POST', body }),
    }),

    verifyOtp: builder.mutation<{ success: boolean; data: { user: User; token: string } }, { phone: string; code: string; role?: string }>({
      query: (body) => ({ url: ENDPOINTS.AUTH_VERIFY_OTP, method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => ENDPOINTS.USER_PROFILE,
      providesTags: ['User'],
      transformResponse: (res: { success: boolean; data: User }) => res.data,
    }),

    updateUserProfile: builder.mutation<User, { name?: string; email?: string; avatarUrl?: string }>({
      query: (body) => ({ url: ENDPOINTS.USER_PROFILE, method: 'PATCH', body }),
      invalidatesTags: ['User'],
      transformResponse: (res: { success: boolean; data: User }) => res.data,
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = authApi;

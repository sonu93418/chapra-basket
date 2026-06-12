/**
 * Blink Box — Wallet API (RTK Query)
 */
import { baseApi } from './baseApi';
import { ENDPOINTS } from '../constants';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWalletData: builder.query<WalletData, void>({
      query: () => ENDPOINTS.USER_WALLET || '/wallet',
      providesTags: ['User'],
      transformResponse: (res: { success: boolean; data: WalletData }) => res.data,
    }),

    topupWallet: builder.mutation<WalletData, { amount: number }>({
      query: (body) => ({ url: '/wallet/topup', method: 'POST', body }),
      invalidatesTags: ['User'],
      transformResponse: (res: { success: boolean; data: WalletData }) => res.data,
    }),
  }),
});

export const {
  useGetWalletDataQuery,
  useTopupWalletMutation,
} = walletApi;

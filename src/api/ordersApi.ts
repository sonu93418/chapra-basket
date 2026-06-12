/**
 * Blink Box — Orders API (RTK Query)
 */
import { baseApi } from './baseApi';
import { ENDPOINTS } from '../constants';

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'packed'
  | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string;
  address: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
  };
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface TrackingData {
  orderId: string;
  status: OrderStatus;
  rider?: {
    id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    lat?: number;
    lng?: number;
  };
  storeLat?: number;
  storeLng?: number;
  customerLat?: number;
  customerLng?: number;
  eta?: number; // minutes
  timeline: { status: string; label: string; timestamp?: string; done: boolean }[];
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<{ items: Order[]; total: number }, { status?: OrderStatus; page?: number }>({
      query: (params) => ({ url: ENDPOINTS.ORDERS, params }),
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => ENDPOINTS.ORDER_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    getOrderTracking: builder.query<TrackingData, string>({
      query: (id) => ENDPOINTS.ORDER_TRACKING(id),
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    createOrder: builder.mutation<Order, { addressId: string; paymentMethod: string; couponCode?: string; items: { productId: string; quantity: number }[]; couponDiscount?: number }>({
      query: (body) => ({ url: ENDPOINTS.ORDERS, method: 'POST', body }),
      invalidatesTags: ['Orders', 'Cart'],
    }),

    cancelOrder: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: ENDPOINTS.ORDER_CANCEL(id), method: 'POST', body: { reason } }),
      invalidatesTags: ['Orders'],
    }),

    rateOrder: builder.mutation<void, { id: string; rating: number; comment?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/review`, method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useRateOrderMutation,
  useUpdateOrderStatusMutation,
} = ordersApi;

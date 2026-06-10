import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_ORDERS } from '../../data/mockData';
import { Order, OrderStatus } from '../../types';

interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  eta?: number;
  speed?: number;
  battery?: number;
  networkStatus?: string;
  updatedAt: string;
}

interface OrdersState {
  items: Order[];
  riderLocations: Record<string, RiderLocation>;
}

const initialState: OrdersState = {
  items: MOCK_ORDERS,
  riderLocations: {},
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.items.unshift(action.payload);
    },
    upsertOrder(state, action: PayloadAction<Order>) {
      const index = state.items.findIndex(order => order.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = { ...state.items[index], ...action.payload };
      } else {
        state.items.unshift(action.payload);
      }
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{
        orderId: string;
        status: OrderStatus;
        estimatedMinutes?: number;
        riderId?: string;
        riderName?: string;
        riderPhone?: string;
        riderRating?: number;
      }>
    ) {
      const order = state.items.find(item => item.id === action.payload.orderId);
      if (!order) return;

      order.status = action.payload.status;
      if (action.payload.estimatedMinutes !== undefined) {
        order.estimatedMinutes = action.payload.estimatedMinutes;
      }
      if (action.payload.riderId) order.riderId = action.payload.riderId;
      if (action.payload.riderName) order.riderName = action.payload.riderName;
      if (action.payload.riderPhone) order.riderPhone = action.payload.riderPhone;
      if (action.payload.riderRating) order.riderRating = action.payload.riderRating;

      const now = new Date().toISOString();
      if (action.payload.status === 'confirmed') order.confirmedAt = now;
      if (action.payload.status === 'delivered') {
        order.deliveredAt = now;
        order.paymentStatus = order.paymentStatus === 'pending' ? 'success' : order.paymentStatus;
      }
      if (action.payload.status === 'cancelled') order.cancelledAt = now;
    },
    updatePaymentStatus(
      state,
      action: PayloadAction<{ orderId: string; paymentStatus: Order['paymentStatus'] }>
    ) {
      const order = state.items.find(item => item.id === action.payload.orderId);
      if (order) order.paymentStatus = action.payload.paymentStatus;
    },
    updateRiderLocation(
      state,
      action: PayloadAction<{
        orderId: string;
        lat: number;
        lng: number;
        heading?: number;
        eta?: number;
        speed?: number;
        battery?: number;
        networkStatus?: string;
      }>
    ) {
      state.riderLocations[action.payload.orderId] = {
        lat: action.payload.lat,
        lng: action.payload.lng,
        heading: action.payload.heading,
        eta: action.payload.eta,
        speed: action.payload.speed,
        battery: action.payload.battery,
        networkStatus: action.payload.networkStatus,
        updatedAt: new Date().toISOString(),
      };

      const order = state.items.find(item => item.id === action.payload.orderId);
      if (order && action.payload.eta !== undefined) {
        order.estimatedMinutes = action.payload.eta;
      }
    },
  },
});

export const {
  addOrder,
  upsertOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateRiderLocation,
} = ordersSlice.actions;

export default ordersSlice.reducer;

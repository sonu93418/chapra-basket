import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import riderReducer from '../features/rider/riderSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import { baseApi } from '../api/baseApi';
import { saveSession, clearSession } from '../utils/storage';

const persistMiddleware = (storeApi: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type === 'auth/loginSuccess') {
    saveSession(action.payload).catch(err => {
      console.warn('[Storage] Middleware failed to save session:', err);
    });
  } else if (action.type === 'auth/logout') {
    clearSession().catch(err => {
      console.warn('[Storage] Middleware failed to clear session:', err);
    });
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    rider: riderReducer,
    wishlist: wishlistReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(baseApi.middleware, persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

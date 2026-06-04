import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product, Coupon } from '../../types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  couponDiscount: 0,
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.product.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.product.id === action.payload);
      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter(i => i.product.id !== action.payload);
        } else {
          item.quantity -= 1;
        }
      }
    },
    clearCart(state) {
      state.items = [];
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    applyCoupon(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
  },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;

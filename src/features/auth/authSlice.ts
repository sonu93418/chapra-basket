import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Address } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  role: 'customer' | 'rider' | 'admin' | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      state.isLoading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setLoading, loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

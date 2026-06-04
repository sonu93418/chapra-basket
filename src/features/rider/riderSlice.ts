import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RiderProfile } from '../../types';

interface RiderState {
  profile: RiderProfile | null;
  isOnline: boolean;
  activeOrderId: string | null;
}

const initialState: RiderState = {
  profile: {
    userId: 'rider-1',
    vehicleType: 'motorcycle',
    kycStatus: 'approved',
    isOnline: true,
    totalDeliveries: 248,
    avgRating: 4.9,
    todayEarnings: 1240,
    todayTrips: 14,
    todayHours: 6.2,
  },
  isOnline: true,
  activeOrderId: null,
};

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    toggleOnline(state) {
      state.isOnline = !state.isOnline;
      if (state.profile) state.profile.isOnline = state.isOnline;
    },
    setActiveOrder(state, action: PayloadAction<string | null>) {
      state.activeOrderId = action.payload;
    },
    updateEarnings(state, action: PayloadAction<{ amount: number }>) {
      if (state.profile) {
        state.profile.todayEarnings += action.payload.amount;
        state.profile.todayTrips += 1;
      }
    },
  },
});

export const { toggleOnline, setActiveOrder, updateEarnings } = riderSlice.actions;
export default riderSlice.reducer;

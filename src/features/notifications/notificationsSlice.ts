import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { Notification } from '../../types';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: MOCK_NOTIFICATIONS,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) notification.isRead = true;
    },
    markAllNotificationsRead(state) {
      state.items.forEach(item => {
        item.isRead = true;
      });
    },
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

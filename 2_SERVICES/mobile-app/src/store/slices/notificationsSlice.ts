import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'job_match' | 'application_update' | 'interview_reminder' | 'message' | 'system' | 'offer' | 'rejection';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  data?: {
    jobId?: string;
    applicationId?: string;
    messageId?: string;
    userId?: string;
    companyId?: string;
  };
  expiresAt?: string;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  jobMatches: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  messages: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  settings: NotificationSettings;
  lastFetched: string | null;
  filters: {
    type?: Notification['type'][];
    isRead?: boolean;
    isImportant?: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sortBy: 'timestamp' | 'importance' | 'type';
  sortOrder: 'asc' | 'desc';
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    pushEnabled: true,
    emailEnabled: true,
    jobMatches: true,
    applicationUpdates: true,
    interviewReminders: true,
    messages: true,
    marketingEmails: false,
    weeklyDigest: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    frequency: 'immediate',
  },
  lastFetched: null,
  filters: {},
  sortBy: 'timestamp',
  sortOrder: 'desc',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add new notification (for real-time updates)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },

    // Mark notification as unread
    markAsUnread: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.isRead) {
        notification.isRead = false;
        state.unreadCount += 1;
      }
    },

    // Toggle notification importance
    toggleImportant: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isImportant = !notification.isImportant;
      }
    },

    // Delete notification
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(notificationIndex, 1);
      }
    },

    // Delete multiple notifications
    deleteNotifications: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      const deletedUnreadCount = state.notifications
        .filter(n => idsToDelete.has(n.id) && !n.isRead)
        .length;
      
      state.notifications = state.notifications.filter(n => !idsToDelete.has(n.id));
      state.unreadCount = Math.max(0, state.unreadCount - deletedUnreadCount);
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Clear read notifications
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.isRead);
    },

    // Update notification settings
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Update quiet hours
    updateQuietHours: (state, action: PayloadAction<NotificationSettings['quietHours']>) => {
      state.settings.quietHours = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<NotificationsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Update sorting
    setSorting: (state, action: PayloadAction<{
      sortBy: NotificationsState['sortBy'];
      sortOrder: NotificationsState['sortOrder'];
    }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Handle notification action (like opening related screen)
    handleNotificationAction: (state, action: PayloadAction<{
      notificationId: string;
      actionType: 'viewed' | 'clicked' | 'dismissed';
    }>) => {
      const { notificationId, actionType } = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification) {
        // Mark as read when action is taken
        if (actionType === 'clicked' || actionType === 'viewed') {
          if (!notification.isRead) {
            notification.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update unread count (for sync with server)
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  toggleImportant,
  deleteNotification,
  deleteNotifications,
  clearAllNotifications,
  clearReadNotifications,
  updateNotificationSettings,
  updateQuietHours,
  updateFilters,
  clearFilters,
  setSorting,
  handleNotificationAction,
  clearError,
  setUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => state.notifications.isLoading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => state.notifications.error;
export const selectNotificationSettings = (state: { notifications: NotificationsState }) => state.notifications.settings;
export const selectNotificationFilters = (state: { notifications: NotificationsState }) => state.notifications.filters;

// Derived selectors
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(n => !n.isRead);

export const selectImportantNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(n => n.isImportant);

export const selectNotificationsByType = (type: Notification['type']) =>
  (state: { notifications: NotificationsState }) =>
    state.notifications.notifications.filter(n => n.type === type);

export const selectRecentNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications
    .filter(n => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(n.timestamp) > dayAgo;
    })
    .slice(0, 10);

export const selectNotificationById = (id: string) =>
  (state: { notifications: NotificationsState }) =>
    state.notifications.notifications.find(n => n.id === id);
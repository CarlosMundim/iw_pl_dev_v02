import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMigrate } from 'redux-persist';

// Import reducers
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import notificationsReducer from './slices/notificationsSlice';
import settingsReducer from './slices/settingsSlice';

// Import API slice
import { apiSlice } from './api/apiSlice';

const migrations = {
  0: (state: any) => {
    // Migration for version 0
    return {
      ...state,
    };
  },
  1: (state: any) => {
    // Migration for version 1
    return {
      ...state,
      settings: {
        ...state.settings,
        biometricEnabled: false,
      },
    };
  },
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: __DEV__ }),
  whitelist: ['auth', 'profile', 'settings'], // Only persist these reducers
  blacklist: ['api'], // Don't persist API cache
};

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  api: apiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
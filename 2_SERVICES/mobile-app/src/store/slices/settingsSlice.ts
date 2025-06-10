import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowRecruiterContact: boolean;
  showActivityStatus: boolean;
  allowDataCollection: boolean;
  allowMarketingEmails: boolean;
}

interface JobSearchSettings {
  autoApply: boolean;
  autoApplyFilters: {
    maxApplicationsPerDay: number;
    salaryMinimum?: number;
    locationRadius?: number;
    jobTypes: string[];
    experienceLevels: string[];
    keywords: string[];
    excludeKeywords: string[];
  };
  jobAlerts: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    filters: {
      keywords?: string;
      location?: string;
      jobType?: string[];
      salaryMin?: number;
    };
  };
  searchRadius: number; // in miles/km
  preferredCurrency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricLogin: boolean;
  sessionTimeout: number; // in minutes
  loginNotifications: boolean;
  deviceTrust: {
    enabled: boolean;
    trustedDevices: string[];
  };
  passwordRequirements: {
    length: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceCommands: boolean;
  keyboardNavigation: boolean;
}

interface LanguageSettings {
  locale: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  timezone: string;
  currency: string;
  measurementUnit: 'metric' | 'imperial';
}

interface StorageSettings {
  cacheSize: number; // in MB
  offlineMode: boolean;
  autoSync: boolean;
  syncFrequency: 'manual' | 'hourly' | 'daily';
  dataRetention: number; // in days
}

interface SettingsState {
  theme: ThemeSettings;
  privacy: PrivacySettings;
  jobSearch: JobSearchSettings;
  security: SecuritySettings;
  accessibility: AccessibilitySettings;
  language: LanguageSettings;
  storage: StorageSettings;
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
  hasUnsavedChanges: boolean;
}

const initialState: SettingsState = {
  theme: {
    mode: 'system',
    primaryColor: '#3B82F6',
    fontSize: 'medium',
    compactMode: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowRecruiterContact: true,
    showActivityStatus: true,
    allowDataCollection: true,
    allowMarketingEmails: false,
  },
  jobSearch: {
    autoApply: false,
    autoApplyFilters: {
      maxApplicationsPerDay: 5,
      jobTypes: ['full-time'],
      experienceLevels: ['mid'],
      keywords: [],
      excludeKeywords: [],
    },
    jobAlerts: {
      enabled: true,
      frequency: 'daily',
      filters: {},
    },
    searchRadius: 25,
    preferredCurrency: 'USD',
  },
  security: {
    twoFactorEnabled: false,
    biometricLogin: false,
    sessionTimeout: 480, // 8 hours
    loginNotifications: true,
    deviceTrust: {
      enabled: false,
      trustedDevices: [],
    },
    passwordRequirements: {
      length: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
  },
  accessibility: {
    screenReader: false,
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    voiceCommands: false,
    keyboardNavigation: false,
  },
  language: {
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: 'USD',
    measurementUnit: 'metric',
  },
  storage: {
    cacheSize: 100, // 100MB
    offlineMode: false,
    autoSync: true,
    syncFrequency: 'daily',
    dataRetention: 30, // 30 days
  },
  isLoading: false,
  error: null,
  lastSynced: null,
  hasUnsavedChanges: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Fetch settings
    fetchSettingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSettingsSuccess: (state, action: PayloadAction<Partial<SettingsState>>) => {
      state.isLoading = false;
      Object.assign(state, action.payload);
      state.error = null;
      state.lastSynced = new Date().toISOString();
      state.hasUnsavedChanges = false;
    },
    fetchSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Save settings
    saveSettingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    saveSettingsSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
      state.lastSynced = new Date().toISOString();
      state.hasUnsavedChanges = false;
    },
    saveSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Theme settings
    updateThemeSettings: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      state.theme = { ...state.theme, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setThemeMode: (state, action: PayloadAction<ThemeSettings['mode']>) => {
      state.theme.mode = action.payload;
      state.hasUnsavedChanges = true;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
      state.hasUnsavedChanges = true;
    },

    // Privacy settings
    updatePrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setProfileVisibility: (state, action: PayloadAction<PrivacySettings['profileVisibility']>) => {
      state.privacy.profileVisibility = action.payload;
      state.hasUnsavedChanges = true;
    },

    // Job search settings
    updateJobSearchSettings: (state, action: PayloadAction<Partial<JobSearchSettings>>) => {
      state.jobSearch = { ...state.jobSearch, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    toggleAutoApply: (state) => {
      state.jobSearch.autoApply = !state.jobSearch.autoApply;
      state.hasUnsavedChanges = true;
    },
    updateAutoApplyFilters: (state, action: PayloadAction<Partial<JobSearchSettings['autoApplyFilters']>>) => {
      state.jobSearch.autoApplyFilters = { ...state.jobSearch.autoApplyFilters, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    updateJobAlerts: (state, action: PayloadAction<Partial<JobSearchSettings['jobAlerts']>>) => {
      state.jobSearch.jobAlerts = { ...state.jobSearch.jobAlerts, ...action.payload };
      state.hasUnsavedChanges = true;
    },

    // Security settings
    updateSecuritySettings: (state, action: PayloadAction<Partial<SecuritySettings>>) => {
      state.security = { ...state.security, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    toggleTwoFactor: (state) => {
      state.security.twoFactorEnabled = !state.security.twoFactorEnabled;
      state.hasUnsavedChanges = true;
    },
    toggleBiometric: (state) => {
      state.security.biometricLogin = !state.security.biometricLogin;
      state.hasUnsavedChanges = true;
    },
    addTrustedDevice: (state, action: PayloadAction<string>) => {
      if (!state.security.deviceTrust.trustedDevices.includes(action.payload)) {
        state.security.deviceTrust.trustedDevices.push(action.payload);
        state.hasUnsavedChanges = true;
      }
    },
    removeTrustedDevice: (state, action: PayloadAction<string>) => {
      state.security.deviceTrust.trustedDevices = state.security.deviceTrust.trustedDevices
        .filter(device => device !== action.payload);
      state.hasUnsavedChanges = true;
    },

    // Accessibility settings
    updateAccessibilitySettings: (state, action: PayloadAction<Partial<AccessibilitySettings>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    toggleAccessibilityFeature: (state, action: PayloadAction<keyof AccessibilitySettings>) => {
      const feature = action.payload;
      state.accessibility[feature] = !state.accessibility[feature];
      state.hasUnsavedChanges = true;
    },

    // Language settings
    updateLanguageSettings: (state, action: PayloadAction<Partial<LanguageSettings>>) => {
      state.language = { ...state.language, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setLocale: (state, action: PayloadAction<string>) => {
      state.language.locale = action.payload;
      state.hasUnsavedChanges = true;
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.language.timezone = action.payload;
      state.hasUnsavedChanges = true;
    },

    // Storage settings
    updateStorageSettings: (state, action: PayloadAction<Partial<StorageSettings>>) => {
      state.storage = { ...state.storage, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setCacheSize: (state, action: PayloadAction<number>) => {
      state.storage.cacheSize = Math.max(10, Math.min(1000, action.payload)); // Min 10MB, Max 1GB
      state.hasUnsavedChanges = true;
    },
    toggleOfflineMode: (state) => {
      state.storage.offlineMode = !state.storage.offlineMode;
      state.hasUnsavedChanges = true;
    },

    // Reset settings
    resetToDefaults: (state, action: PayloadAction<keyof SettingsState | 'all'>) => {
      const section = action.payload;
      if (section === 'all') {
        Object.assign(state, initialState);
      } else if (section in initialState) {
        state[section] = initialState[section];
      }
      state.hasUnsavedChanges = true;
    },

    // Import/Export settings
    importSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
      state.hasUnsavedChanges = true;
    },

    // Clear unsaved changes flag
    markChangesSaved: (state) => {
      state.hasUnsavedChanges = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  saveSettingsStart,
  saveSettingsSuccess,
  saveSettingsFailure,
  updateThemeSettings,
  setThemeMode,
  setPrimaryColor,
  updatePrivacySettings,
  setProfileVisibility,
  updateJobSearchSettings,
  toggleAutoApply,
  updateAutoApplyFilters,
  updateJobAlerts,
  updateSecuritySettings,
  toggleTwoFactor,
  toggleBiometric,
  addTrustedDevice,
  removeTrustedDevice,
  updateAccessibilitySettings,
  toggleAccessibilityFeature,
  updateLanguageSettings,
  setLocale,
  setTimezone,
  updateStorageSettings,
  setCacheSize,
  toggleOfflineMode,
  resetToDefaults,
  importSettings,
  markChangesSaved,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings;
export const selectThemeSettings = (state: { settings: SettingsState }) => state.settings.theme;
export const selectPrivacySettings = (state: { settings: SettingsState }) => state.settings.privacy;
export const selectJobSearchSettings = (state: { settings: SettingsState }) => state.settings.jobSearch;
export const selectSecuritySettings = (state: { settings: SettingsState }) => state.settings.security;
export const selectAccessibilitySettings = (state: { settings: SettingsState }) => state.settings.accessibility;
export const selectLanguageSettings = (state: { settings: SettingsState }) => state.settings.language;
export const selectStorageSettings = (state: { settings: SettingsState }) => state.settings.storage;
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.isLoading;
export const selectSettingsError = (state: { settings: SettingsState }) => state.settings.error;
export const selectHasUnsavedChanges = (state: { settings: SettingsState }) => state.settings.hasUnsavedChanges;

// Derived selectors
export const selectCurrentTheme = (state: { settings: SettingsState }) => {
  const { mode, primaryColor, fontSize, compactMode } = state.settings.theme;
  return {
    mode,
    primaryColor,
    fontSize,
    compactMode,
    isDark: mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  };
};

export const selectEffectivePrivacyLevel = (state: { settings: SettingsState }) => {
  const privacy = state.settings.privacy;
  if (privacy.profileVisibility === 'private') return 'private';
  if (!privacy.allowRecruiterContact) return 'limited';
  return 'open';
};

export const selectAutoApplyEligibility = (state: { settings: SettingsState }) => {
  const { autoApply, autoApplyFilters } = state.settings.jobSearch;
  return {
    enabled: autoApply,
    dailyLimit: autoApplyFilters.maxApplicationsPerDay,
    hasFilters: autoApplyFilters.keywords.length > 0 || autoApplyFilters.jobTypes.length > 0,
  };
};
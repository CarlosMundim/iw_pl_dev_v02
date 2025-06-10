import React, { useEffect } from 'react';
import {
  StatusBar,
  useColorScheme,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import FlashMessage from 'react-native-flash-message';

import { store, persistor } from './store';
import { AppNavigator } from './navigation/AppNavigator';
import { lightTheme, darkTheme } from './theme';
import { LoadingScreen } from './components/LoadingScreen';
import { useNotifications } from './hooks/useNotifications';
import { navigationRef } from './navigation/navigationService';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Initialize Firebase services
    const initializeFirebase = async () => {
      try {
        // Enable analytics
        await analytics().setAnalyticsCollectionEnabled(true);
        
        // Enable crashlytics
        await crashlytics().setCrashlyticsCollectionEnabled(true);
        
        console.log('✅ Firebase services initialized');
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
      }
    };

    // Request notification permissions
    const requestNotificationPermission = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted');
          
          // Get FCM token
          const fcmToken = await messaging().getToken();
          console.log('📱 FCM Token:', fcmToken);
          
          // TODO: Send token to backend for user registration
        } else {
          console.log('❌ Notification permission denied');
        }
      } catch (error) {
        console.error('❌ Notification permission error:', error);
      }
    };

    initializeFirebase();
    requestNotificationPermission();

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📬 Foreground message received:', remoteMessage);
      
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message'
      );
    });

    // Handle background/quit state messages
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📱 App opened from background notification:', remoteMessage);
      // TODO: Navigate to specific screen based on notification data
    });

    // Check if app was opened from a notification when closed
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📱 App opened from quit state notification:', remoteMessage);
          // TODO: Navigate to specific screen based on notification data
        }
      });

    return unsubscribe;
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <NavigationContainer ref={navigationRef} theme={theme}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.surface}
            />
            <AppNavigator />
            <FlashMessage position="top" />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
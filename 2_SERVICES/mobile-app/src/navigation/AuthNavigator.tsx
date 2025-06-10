import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          title: 'New Password',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          title: 'Welcome',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
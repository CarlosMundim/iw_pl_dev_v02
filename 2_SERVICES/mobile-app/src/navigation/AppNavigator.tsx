import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

// Import selectors
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { selectUnreadCount } from '../store/slices/notificationsSlice';
import { selectCurrentTheme } from '../store/slices/settingsSlice';

// Import placeholder screens (to be created)
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import JobDetailsScreen from '../screens/jobs/JobDetailsScreen';
import ApplicationsScreen from '../screens/applications/ApplicationsScreen';
import ApplicationDetailsScreen from '../screens/applications/ApplicationDetailsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import SearchScreen from '../screens/search/SearchScreen';

// Type definitions
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  JobDetails: { jobId: string };
  ApplicationDetails: { applicationId: string };
  EditProfile: undefined;
  Notifications: undefined;
  Settings: undefined;
  Messages: { conversationId?: string };
  Search: { query?: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Applications: undefined;
  Profile: undefined;
  More: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabNavigator: React.FC = () => {
  const theme = useSelector(selectCurrentTheme);
  const unreadCount = useSelector(selectUnreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Applications':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'More':
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarBadge: route.name === 'More' && unreadCount > 0 ? unreadCount : undefined,
        headerShown: false,
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: theme.isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: theme.isDark ? '#374151' : '#E5E7EB',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobsScreen}
        options={{ tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen}
        options={{ tabBarLabel: 'Applications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
};

const MoreScreen: React.FC = () => {
  const unreadCount = useSelector(selectUnreadCount);
  
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="notifications-outline" size={24} color="#3B82F6" />
                <Text style={styles.quickActionText}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="chatbubbles-outline" size={24} color="#10B981" />
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="settings-outline" size={24} color="#6B7280" />
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="help-circle-outline" size={24} color="#F59E0B" />
                <Text style={styles.quickActionText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
              Account
            </Text>
            <View style={styles.menuSection}>
              <MenuItem icon="person-outline" title="Edit Profile" />
              <MenuItem icon="shield-checkmark-outline" title="Privacy & Security" />
              <MenuItem icon="card-outline" title="Billing & Payments" />
              <MenuItem icon="download-outline" title="Download Data" />
            </View>
          </View>

          {/* Support */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
              Support
            </Text>
            <View style={styles.menuSection}>
              <MenuItem icon="help-circle-outline" title="Help Center" />
              <MenuItem icon="mail-outline" title="Contact Support" />
              <MenuItem icon="star-outline" title="Rate the App" />
              <MenuItem icon="share-outline" title="Share iWORKZ" />
            </View>
          </View>

          {/* Legal */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
              Legal
            </Text>
            <View style={styles.menuSection}>
              <MenuItem icon="document-text-outline" title="Terms of Service" />
              <MenuItem icon="shield-outline" title="Privacy Policy" />
              <MenuItem icon="information-circle-outline" title="About" />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton}>
            <Icon name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem: React.FC<{ icon: string; title: string; onPress?: () => void }> = ({ 
  icon, 
  title, 
  onPress 
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Icon name={icon} size={20} color="#6B7280" />
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <Icon name="chevron-forward-outline" size={16} color="#9CA3AF" />
  </TouchableOpacity>
);

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const theme = useSelector(selectCurrentTheme);

  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.primaryColor,
      background: theme.isDark ? '#111827' : '#FFFFFF',
      card: theme.isDark ? '#1F2937' : '#FFFFFF',
      text: theme.isDark ? '#F9FAFB' : '#1F2937',
      border: theme.isDark ? '#374151' : '#E5E7EB',
      notification: '#EF4444',
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="JobDetails" 
              component={JobDetailsScreen}
              options={{ 
                headerShown: true, 
                title: 'Job Details',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="ApplicationDetails" 
              component={ApplicationDetailsScreen}
              options={{ 
                headerShown: true, 
                title: 'Application Details',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                headerShown: true, 
                title: 'Edit Profile',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{ 
                headerShown: true, 
                title: 'Search Jobs',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = {
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '48%',
    aspectRatio: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative' as const,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#374151',
    textAlign: 'center' as const,
  },
  badge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500' as const,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
};

export default AppNavigator;
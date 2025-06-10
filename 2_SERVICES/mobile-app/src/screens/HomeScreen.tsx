import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import selectors
import { selectUser } from '../store/slices/authSlice';
import { selectCurrentTheme } from '../store/slices/settingsSlice';
import { selectRecentApplications, selectUpcomingInterviews } from '../store/slices/applicationsSlice';
import { selectRecommendedJobs, selectFeaturedJobs } from '../store/slices/jobsSlice';
import { selectUnreadCount } from '../store/slices/notificationsSlice';
import { selectCompletionScore } from '../store/slices/profileSlice';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const user = useSelector(selectUser);
  const theme = useSelector(selectCurrentTheme);
  const recentApplications = useSelector(selectRecentApplications);
  const upcomingInterviews = useSelector(selectUpcomingInterviews);
  const recommendedJobs = useSelector(selectRecommendedJobs);
  const featuredJobs = useSelector(selectFeaturedJobs);
  const unreadCount = useSelector(selectUnreadCount);
  const completionScore = useSelector(selectCompletionScore);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.firstName || 'User';

  return (
    <View style={[styles.container, { backgroundColor: theme.isDark ? '#111827' : '#F9FAFB' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
              {getGreeting()}, {firstName}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
              Ready to find your next opportunity?
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Icon 
              name="notifications-outline" 
              size={24} 
              color={theme.isDark ? '#F9FAFB' : '#1F2937'} 
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.welcomeTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
            Welcome to iWORKZ
          </Text>
          <Text style={[styles.welcomeText, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
            Your AI-powered job matching platform. Let's help you find the perfect opportunity.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}
              onPress={() => navigation.navigate('Jobs' as never)}
            >
              <Icon name="search-outline" size={32} color="#3B82F6" />
              <Text style={[styles.actionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                Search Jobs
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Icon name="person-outline" size={32} color="#10B981" />
              <Text style={[styles.actionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                My Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}
              onPress={() => navigation.navigate('Applications' as never)}
            >
              <Icon name="document-text-outline" size={32} color="#F59E0B" />
              <Text style={[styles.actionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                Applications
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}
              onPress={() => navigation.navigate('More' as never)}
            >
              <Icon name="settings-outline" size={32} color="#8B5CF6" />
              <Text style={[styles.actionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
            Your Progress
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
              <Icon name="document-text-outline" size={24} color="#3B82F6" />
              <Text style={[styles.statValue, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                {recentApplications.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
                Applications
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
              <Icon name="calendar-outline" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                {upcomingInterviews.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
                Interviews
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
              <Icon name="star-outline" size={24} color="#F59E0B" />
              <Text style={[styles.statValue, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                {completionScore}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
                Profile Complete
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
              <Icon name="briefcase-outline" size={24} color="#8B5CF6" />
              <Text style={[styles.statValue, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
                {recommendedJobs.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
                Job Matches
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    aspectRatio: 1.2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
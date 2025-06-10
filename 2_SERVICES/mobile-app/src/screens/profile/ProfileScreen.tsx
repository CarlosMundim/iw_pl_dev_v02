import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../../store/slices/settingsSlice';

const ProfileScreen: React.FC = () => {
  const theme = useSelector(selectCurrentTheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.isDark ? '#111827' : '#F9FAFB' }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.isDark ? '#F9FAFB' : '#1F2937' }]}>
          Profile
        </Text>
        <Text style={[styles.subtitle, { color: theme.isDark ? '#9CA3AF' : '#6B7280' }]}>
          User profile management coming soon...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;
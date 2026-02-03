import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import jobsService from '../../api/services/jobsService';
import eventsService from '../../api/services/eventsService';
import userService from '../../api/services/userService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Job Card Component
const JobCard = ({ job, onPress }) => (
  <TouchableOpacity style={styles.jobCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.jobHeader}>
      <View style={styles.companyLogo}>
        <Ionicons name="business" size={24} color={colors.primary} />
      </View>
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle} numberOfLines={1}>{job.title || 'Job Title'}</Text>
        <Text style={styles.companyName} numberOfLines={1}>{job.companyName || job.corporate?.name || 'Company'}</Text>
      </View>
      <TouchableOpacity style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
    <View style={styles.jobDetails}>
      <View style={styles.jobTag}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.jobTagText}>{job.location || 'Remote'}</Text>
      </View>
      <View style={styles.jobTag}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={styles.jobTagText}>{job.type || 'Full Time'}</Text>
      </View>
      {job.salary && (
        <View style={styles.jobTag}>
          <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
          <Text style={styles.jobTagText}>{job.salary}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// Event Card Component
const EventCard = ({ event, onPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.eventImageContainer}>
      {event.image ? (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      ) : (
        <View style={styles.eventImagePlaceholder}>
          <Ionicons name="calendar" size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.eventDate}>
        <Text style={styles.eventDateDay}>{new Date(event.date || event.startDate).getDate() || '01'}</Text>
        <Text style={styles.eventDateMonth}>
          {new Date(event.date || event.startDate).toLocaleString('default', { month: 'short' }) || 'Jan'}
        </Text>
      </View>
    </View>
    <View style={styles.eventInfo}>
      <Text style={styles.eventTitle} numberOfLines={2}>{event.title || event.name || 'Event Title'}</Text>
      <View style={styles.eventMeta}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.eventLocation} numberOfLines={1}>
          {event.location || event.venue || 'Online'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Empty State Component
const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon} size={48} color={colors.textMuted} />
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch jobs, events, and user profile in parallel
      const [jobsResult, eventsResult, userResult] = await Promise.all([
        jobsService.getAllJobs(),
        eventsService.getAllEvents(),
        userService.getUserDetails(),
      ]);

      if (jobsResult.success) {
        setJobs(Array.isArray(jobsResult.data) ? jobsResult.data : []);
      } else {
        console.log('Jobs fetch issue:', jobsResult.error);
      }

      if (eventsResult.success) {
        setEvents(Array.isArray(eventsResult.data) ? eventsResult.data : []);
      } else {
        console.log('Events fetch issue:', eventsResult.error);
      }

      if (userResult.success) {
        setUserProfile(userResult.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobDetail', { jobId: job._id || job._key });
  };

  const handleEventPress = (event) => {
    // Navigate to event detail when implemented
    console.log('Event pressed:', event._id);
  };

  const renderHeader = () => (
    <>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Ionicons name="git-network" size={24} color={colors.primary} />
            <Text style={styles.logoText}>BUZZBREACH</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.white} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {userProfile?.firstName || user?.firstName || 'User'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Find your dream job or attend exciting events
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, events..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('Jobs')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(108, 99, 255, 0.15)' }]}>
            <Ionicons name="briefcase" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('Events')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="calendar" size={24} color={colors.success} />
          </View>
          <Text style={styles.quickActionText}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="person" size={24} color={colors.warning} />
          </View>
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="settings" size={24} color={colors.info} />
          </View>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : jobs.length > 0 ? (
          <FlatList
            data={jobs.slice(0, 5)}
            keyExtractor={(item) => item._id || item._key || Math.random().toString()}
            renderItem={({ item }) => (
              <JobCard job={item} onPress={() => handleJobPress(item)} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <EmptyState
            icon="briefcase-outline"
            title="No jobs available"
            subtitle="Check back later for new opportunities"
          />
        )}
      </View>

      {/* Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : events.length > 0 ? (
          <FlatList
            data={events.slice(0, 5)}
            keyExtractor={(item) => item._id || item._key || Math.random().toString()}
            renderItem={({ item }) => (
              <EventCard event={item} onPress={() => handleEventPress(item)} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No upcoming events"
            subtitle="Stay tuned for exciting events"
          />
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Ionicons name="briefcase" size={28} color={colors.primary} />
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Open Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={28} color={colors.success} />
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={28} color={colors.warning} />
          <Text style={styles.statNumber}>1K+</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
      </View>
    </>
  );

  // Error State
  if (error && !loading && jobs.length === 0 && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={64} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.backgroundCard}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  welcomeSection: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  welcomeSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.white,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  quickActionBtn: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Sections
  section: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  seeAllText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Job Card
  jobCard: {
    width: isSmallDevice ? width * 0.85 : width * 0.75,
    minWidth: 260,
    maxWidth: 340,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  companyName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookmarkBtn: {
    padding: spacing.sm,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  jobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  jobTagText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: 4,
  },
  
  // Event Card
  eventCard: {
    width: isSmallDevice ? width * 0.7 : width * 0.6,
    minWidth: 200,
    maxWidth: 280,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventImageContainer: {
    height: 120,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDate: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  eventDateDay: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  eventDateMonth: {
    fontSize: fontSize.xs,
    color: colors.white,
    textTransform: 'uppercase',
  },
  eventInfo: {
    padding: spacing.md,
  },
  eventTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.lg,
  },
  errorMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  retryButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
});

export default HomeScreen;

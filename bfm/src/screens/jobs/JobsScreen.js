import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllJobs, clearFilters } from '../../store/slices/jobsSlice';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import { LoadingSpinner } from '../../components/common/Loading';

// Job Card Component
const JobCard = ({ job, onPress }) => (
  <TouchableOpacity style={styles.jobCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.jobHeader}>
      <View style={styles.companyLogo}>
        <Ionicons name="business" size={24} color={colors.primary} />
      </View>
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle} numberOfLines={1}>{job.title || 'Job Title'}</Text>
        <Text style={styles.companyName} numberOfLines={1}>
          {job.companyName || job.corporate?.name || 'Company'}
        </Text>
      </View>
      <TouchableOpacity style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
    
    <Text style={styles.jobDescription} numberOfLines={2}>
      {job.description || 'No description available'}
    </Text>
    
    <View style={styles.jobDetails}>
      <View style={styles.jobTag}>
        <Ionicons name="location-outline" size={14} color={colors.primary} />
        <Text style={styles.jobTagText}>{job.location || 'Remote'}</Text>
      </View>
      <View style={styles.jobTag}>
        <Ionicons name="time-outline" size={14} color={colors.primary} />
        <Text style={styles.jobTagText}>{job.type || job.jobType || 'Full Time'}</Text>
      </View>
      {job.salary && (
        <View style={styles.jobTag}>
          <Ionicons name="cash-outline" size={14} color={colors.primary} />
          <Text style={styles.jobTagText}>{job.salary}</Text>
        </View>
      )}
    </View>
    
    {job.skills && job.skills.length > 0 && (
      <View style={styles.skillsContainer}>
        {job.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {job.skills.length > 3 && (
          <Text style={styles.moreSkills}>+{job.skills.length - 3} more</Text>
        )}
      </View>
    )}
  </TouchableOpacity>
);

// Empty State Component  
const EmptyState = ({ onAction }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="briefcase-outline" size={64} color={colors.textMuted} />
    <Text style={styles.emptyTitle}>No Jobs Found</Text>
    <Text style={styles.emptyMessage}>
      We couldn't find any jobs. Try refreshing or check back later.
    </Text>
    {onAction && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
        <Text style={styles.emptyButtonText}>Refresh</Text>
      </TouchableOpacity>
    )}
  </View>
);

const JobsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { jobs, isLoading } = useSelector((state) => state.jobs);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search query
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      const filtered = jobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.companyName?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [jobs, localSearchQuery]);

  const loadJobs = () => {
    dispatch(fetchAllJobs());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(clearFilters());
    await dispatch(fetchAllJobs());
    setRefreshing(false);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
  };

  const renderJobItem = useCallback(
    ({ item }) => (
      <JobCard
        job={item}
        onPress={() => navigation.navigate('JobDetail', { jobId: item._key || item._id, job: item })}
      />
    ),
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Jobs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor={colors.textMuted}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          returnKeyType="search"
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Available Positions</Text>
        <Text style={styles.resultsCount}>{filteredJobs?.length || 0} jobs</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return <EmptyState onAction={loadJobs} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item._key || item._id || Math.random().toString()}
          renderItem={renderJobItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.backgroundCard}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  
  // Job Card Styles
  jobCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  jobDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
    color: colors.textSecondary,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  skillTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  skillText: {
    fontSize: fontSize.xs,
    color: colors.success,
  },
  moreSkills: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
  },
  emptyMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  emptyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
});

export default JobsScreen;

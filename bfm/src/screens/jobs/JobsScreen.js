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
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllJobs, clearFilters } from '../../store/slices/jobsSlice';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import { LoadingSpinner } from '../../components/common/Loading';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';
import userService from '../../api/services/userService';

const TABS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'applied', label: 'Jobs Applied' },
  { key: 'recent', label: 'Recent Jobs Applied' },
];

// Job Card Component matching Figma design
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
    </View>
    
    <Text style={styles.jobDescription} numberOfLines={3}>
      {job.description || 'No description available'}
    </Text>
    
    <View style={styles.jobFooter}>
      <View style={styles.jobTypeTag}>
        <Text style={styles.jobTypeText}>{job.type || job.jobType || 'Full-time'}</Text>
      </View>
      <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
        <Text style={styles.viewDetailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// Empty State Component  
const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const JobsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { jobs, isLoading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [filterValues, setFilterValues] = useState({
    jobLevel: [],
    employmentType: [],
    workLocation: [],
    datePosted: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    jobLevel: [],
    employmentType: [],
    workLocation: [],
    datePosted: '',
  });

  // Dummy jobs data matching Figma design
  const dummyJobs = [
    {
      id: '1',
      title: 'UX Researcher',
      description: 'Design clean, human-centered web and mobile interfaces in Figma for SaaS and enterprise products...',
      companyName: 'NovaTech Studios',
      type: 'Full-time',
      isApplied: false,
      isRecentApplied: false,
    },
    {
      id: '2',
      title: 'Frontend Developer',
      description: 'Build responsive, accessible web apps using React and Tailwind, collaborating closely with designers...',
      companyName: 'PixelWave Labs',
      type: 'Remote',
      isApplied: true,
      isRecentApplied: false,
    },
    {
      id: '3',
      title: 'Data Analyst',
      description: 'Interpret trends and create dashboards to support business decisions and performance tracking...',
      companyName: 'CloudShift Analytics',
      type: 'Full-time',
      isApplied: true,
      isRecentApplied: false,
    },
    {
      id: '4',
      title: 'Content Strategist',
      description: 'Design clean, human-centered web and mobile interfaces in Figma for SaaS and enterprise products...',
      companyName: 'Verve Digital',
      type: 'Full-time',
      isApplied: false,
      isRecentApplied: false,
    },
    {
      id: '5',
      title: 'Product Manager',
      description: 'Lead product development initiatives and collaborate with cross-functional teams to deliver innovative solutions...',
      companyName: 'TechVenture Inc',
      type: 'Full-time',
      isApplied: false,
      isRecentApplied: false,
    },
  ];

  useEffect(() => {
    loadJobs();
    
    // Load user profile
    const loadUserProfile = async () => {
      try {
        if (user?.id) {
          const profile = await userService.getUserDetails(user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, [user]);

  const loadJobs = () => {
    dispatch(fetchAllJobs());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(clearFilters());
    await dispatch(fetchAllJobs());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
  };

  useEffect(() => {
    if (showFilterOverlay) return;
    if (isSearchFocused || localSearchQuery.trim() !== '') {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setShowFilterOverlay(false);
    }
  }, [localSearchQuery, isSearchFocused, showFilterOverlay]);

  const handleBackPress = () => {
    setLocalSearchQuery('');
    setIsSearchFocused(false);
    setIsSearching(false);
    setShowFilterOverlay(false);
  };

  const handleResetFilters = () => {
    setFilterValues({
      jobLevel: [],
      employmentType: [],
      workLocation: [],
      datePosted: '',
    });
    setAppliedFilters({
      jobLevel: [],
      employmentType: [],
      workLocation: [],
      datePosted: '',
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setShowFilterOverlay(false);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (appliedFilters.jobLevel.length > 0) count++;
    if (appliedFilters.employmentType.length > 0) count++;
    if (appliedFilters.workLocation.length > 0) count++;
    if (appliedFilters.datePosted) count++;
    return count;
  };

  const toggleFilterOption = (category, value) => {
    setFilterValues(prev => {
      const currentValues = prev[category] || [];
      const isSelected = currentValues.includes(value);
      
      if (category === 'datePosted') {
        return {
          ...prev,
          datePosted: isSelected ? '' : value,
        };
      }
      
      return {
        ...prev,
        [category]: isSelected
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value],
      };
    });
  };

  const getFilteredJobs = () => {
    let filtered = [...dummyJobs];

    // Filter by tab (only when not searching)
    if (!isSearching) {
      if (activeTab === 'applied') {
        filtered = filtered.filter(job => job.isApplied);
      } else if (activeTab === 'recent') {
        filtered = filtered.filter(job => job.isRecentApplied);
      }
    }

    // Filter by search query
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.companyName?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (appliedFilters.jobLevel.length > 0) {
      // Filter by job level (would need job level data)
    }
    if (appliedFilters.employmentType.length > 0) {
      filtered = filtered.filter(job => 
        appliedFilters.employmentType.includes(job.type)
      );
    }
    if (appliedFilters.workLocation.length > 0) {
      // Filter by work location (would need location data)
    }
    if (appliedFilters.datePosted) {
      // Filter by date posted (would need date data)
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  const renderJobItem = useCallback(
    ({ item }) => (
      <JobCard
        job={item}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id, job: item })}
      />
    ),
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.fixedHeader}>
      {/* App Header */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <BuzzBreachLogo size={24} />
            <Text style={styles.logoText}>BUZZBREACH</Text>
          </View>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>breaking through the noise</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="#000000" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="paper-plane-outline" size={22} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.profileButton}>
              {userProfile?.profilePicture ? (
                <Image 
                  source={{ uri: userProfile.profilePicture }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileText}>
                    {userProfile?.firstName?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        {isSearching && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        )}
        <View style={[styles.searchContainer, isSearching && styles.searchContainerActive]}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, events..."
            placeholderTextColor="#9CA3AF"
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              if (localSearchQuery.trim() === '') {
                setIsSearchFocused(false);
              }
            }}
            autoFocus={isSearching}
            returnKeyType="search"
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        {isSearching && (
          <TouchableOpacity 
            style={styles.searchFilterButton}
            onPress={() => {
              setIsSearchFocused(true);
              setIsSearching(true);
              setFilterValues({ ...appliedFilters });
              setShowFilterOverlay(true);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs - Hide when searching */}
      {!isSearching && (
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    
    if (isSearching) {
      return <EmptyState message="No Jobs Found" />;
    }
    
    if (activeTab === 'recent') {
      return <EmptyState message="No Recent Jobs Applied" />;
    }
    
    return <EmptyState message="No jobs found" />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Fixed Header Section - Not Scrollable */}
      {renderHeader()}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
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

      {/* Filter Overlay */}
      <Modal
        visible={isSearching && showFilterOverlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterOverlay(false)}
      >
        <View style={styles.filterOverlayBackdrop}>
          <TouchableOpacity
            style={styles.filterOverlayBackdropTouchable}
            activeOpacity={1}
            onPress={() => setShowFilterOverlay(false)}
          />
          <View style={styles.filterOverlay} onStartShouldSetResponder={() => true}>
            <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.filterContent}>
                <Text style={styles.filterSectionTitle}>Filter by:</Text>
                
                {/* Job Level */}
                <View style={styles.filterCategory}>
                  <Text style={styles.filterCategoryTitle}>Job Level</Text>
                  {['Intern', 'Entry Level', 'Mid Level', 'Junior Management', 'Senior Management', 'Director', 'VP or Above'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={styles.filterOption}
                      onPress={() => toggleFilterOption('jobLevel', level)}
                    >
                      <View style={styles.checkbox}>
                        {filterValues.jobLevel.includes(level) && (
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Type of Employment */}
                <View style={styles.filterCategory}>
                  <Text style={styles.filterCategoryTitle}>Type of Employment</Text>
                  {['Full Time', 'Part Time', 'Internship', 'Contract / Freelance', 'Voluntary'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.filterOption}
                      onPress={() => toggleFilterOption('employmentType', type)}
                    >
                      <View style={styles.checkbox}>
                        {filterValues.employmentType.includes(type) && (
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Work Location */}
                <View style={styles.filterCategory}>
                  <Text style={styles.filterCategoryTitle}>Work Location</Text>
                  {['On Site', 'Work from Home', 'Hybrid'].map((location) => (
                    <TouchableOpacity
                      key={location}
                      style={styles.filterOption}
                      onPress={() => toggleFilterOption('workLocation', location)}
                    >
                      <View style={styles.checkbox}>
                        {filterValues.workLocation.includes(location) && (
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date Posted */}
                <View style={styles.filterCategory}>
                  <Text style={styles.filterCategoryTitle}>Date Posted</Text>
                  {['Past 24 Hours', 'Past Week', 'Past Month', 'Anytime'].map((date) => (
                    <TouchableOpacity
                      key={date}
                      style={styles.filterOption}
                      onPress={() => toggleFilterOption('datePosted', date)}
                    >
                      <View style={styles.checkbox}>
                        {filterValues.datePosted === date && (
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>{date}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>
                  Apply Filters{getAppliedFiltersCount() > 0 ? `(${getAppliedFiltersCount()})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#000000',
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  taglineContainer: {
    marginLeft: 20 + spacing.xs,
    marginTop: 1,
  },
  tagline: {
    fontSize: fontSize.xs,
    color: '#6B6B80',
    letterSpacing: 0.5,
    fontWeight: '300',
    textTransform: 'lowercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainerActive: {
    borderColor: colors.primary,
  },
  searchFilterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  
  // Job Card Styles
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  companyName: {
    fontSize: fontSize.sm,
    color: '#6B7280',
  },
  jobDescription: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTypeTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  jobTypeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  viewDetailsButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    minHeight: 300,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Filter Overlay
  filterOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterOverlayBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  filterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  filterScrollView: {
    maxHeight: '70%',
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.md,
  },
  filterCategory: {
    marginBottom: spacing.lg,
  },
  filterCategoryTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionText: {
    fontSize: fontSize.md,
    color: '#000000',
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default JobsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';
import { LoadingSpinner } from '../../components/common/Loading';

// Image imports - using require for local assets
const image1b = require('../../../assets/1b.jpg');
const image1c = require('../../../assets/1c.jpg');
import userService from '../../api/services/userService';

const TABS = [
  { key: 'all', label: 'All Events' },
  { key: 'registered', label: 'Registered Events' },
  { key: 'upcoming', label: 'Upcoming Events' },
];

const SEARCH_FILTER_TABS = [
  { key: 'Corporate', label: 'Corporate' },
  { key: 'People', label: 'People' },
  { key: 'Events', label: 'Events' },
];

// Event Card Component matching Figma design
const EventCard = ({ event, onPress, compact = false }) => {
  if (compact) {
    // Compact layout for search results
    return (
      <TouchableOpacity style={styles.eventCardCompact} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.eventImageContainerCompact}>
          {event.image ? (
            <Image source={event.image} style={styles.eventImageCompact} />
          ) : event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.eventImageCompact} />
          ) : (
            <View style={styles.eventImagePlaceholderCompact}>
              <Ionicons name="laptop-outline" size={24} color={colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.eventContentCompact}>
          <Text style={styles.eventTitleCompact} numberOfLines={1}>
            {event.title || event.name || 'Techno Event'}
          </Text>
          
          <Text style={styles.eventDescriptionCompact} numberOfLines={2}>
            {event.description || 'Synergy 2025 is the annual technical and cultural extrava-ganza organize...'}
          </Text>
          
          <View style={styles.eventInfoCompact}>
            <Text style={styles.eventModeCompact}>Event Mode: {event.mode || 'Online'}</Text>
            <Text style={styles.eventStatusCompact}>Status: {event.status || 'Ended'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Full layout for regular event list
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.eventImageContainer}>
        {event.image ? (
          <Image source={event.image} style={styles.eventImage} />
        ) : event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        ) : (
          <View style={styles.eventImagePlaceholder}>
            <Ionicons name="laptop-outline" size={40} color={colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title || event.name || 'Techno Event'}
        </Text>
        
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description || 'Synergy 2025 is the annual technical and cultural extravaganza organized by XYZ Engineering Colle...'}
        </Text>
        
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Event Mode:</Text>
            <Text style={[styles.eventInfoValue, { color: '#10B981' }]}>{event.mode || 'Online'}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Status:</Text>
            <Text style={[styles.eventInfoValue, styles.eventStatus]}>
              {event.status || 'Ended'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component
const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const EventsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, isLoading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSearchFilter, setActiveSearchFilter] = useState('Corporate');
  const [searchResults, setSearchResults] = useState({
    Corporate: [],
    People: [],
    Events: [],
  });
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [filterValues, setFilterValues] = useState({
    fromDate: '',
    toDate: '',
    location: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    location: '',
  });

  // Dummy events data matching Figma design
  const dummyEvents = [
    {
      id: '1',
      title: 'Techno Event',
      description: 'Synergy 2025 is the annual technical and cultural extravaganza organized by XYZ Engineering Colle...',
      mode: 'Online',
      status: 'Ended',
      image: image1b,
      isRegistered: true,
      isUpcoming: false,
    },
    {
      id: '2',
      title: 'Techno Event',
      description: 'Synergy 2025 is the annual technical and cultural extravaganza organized by XYZ Engineering Colle...',
      mode: 'Online',
      status: 'Ended',
      image: image1c,
      isRegistered: true,
      isUpcoming: false,
    },
    {
      id: '3',
      title: 'Tech Conference 2024',
      description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative startups.',
      mode: 'Offline',
      status: 'Upcoming',
      image: image1b,
      isRegistered: false,
      isUpcoming: true,
    },
    {
      id: '4',
      title: 'Design Workshop',
      description: 'Learn the latest design trends and tools from expert designers in this hands-on workshop.',
      mode: 'Online',
      status: 'Upcoming',
      image: image1c,
      isRegistered: true,
      isUpcoming: true,
    },
    {
      id: '5',
      title: 'Networking Mixer',
      description: 'Connect with professionals from various industries in this casual networking event.',
      mode: 'Offline',
      status: 'Upcoming',
      image: image1b,
      isRegistered: false,
      isUpcoming: true,
    },
  ];

  // Mock search results - matching Figma exactly
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults({ Corporate: [], People: [], Events: [] });
      return;
    }

    const queryLower = query.toLowerCase();
    
    // Mock Corporate results - exact order from Figma
    const corporateResults = [
      { id: 'c1', name: '21 Industries', type: 'Corporate', icon: 'settings-outline' },
      { id: 'c2', name: 'Bowen Group', type: 'Corporate', icon: 'heart' },
    ].filter(item => item.name.toLowerCase().includes(queryLower) || queryLower.includes('protest'));

    // Mock People results - exact order from Figma
    const peopleResults = [
      { id: 'p1', name: 'Darcy Patterson', type: 'People', avatar: null },
      { id: 'p2', name: 'Alex Hamilton', type: 'People', avatar: null },
      { id: 'p3', name: 'Taylor Smith', type: 'People', avatar: null },
    ].filter(item => item.name.toLowerCase().includes(queryLower) || queryLower.includes('protest'));

    // Mock Events results - show all events for "protest" search, matching Figma
    let eventsResults = [];
    if (queryLower.includes('protest')) {
      // For "protest" search, show multiple Techno Event cards
      eventsResults = [
        ...dummyEvents.slice(0, 2).map(event => ({ ...event, type: 'Events' })),
        ...dummyEvents.slice(0, 3).map((event, idx) => ({ 
          ...event, 
          id: `event-${idx + 3}`,
          type: 'Events' 
        })),
      ];
    } else {
      eventsResults = dummyEvents
        .filter(event => 
          event.title.toLowerCase().includes(queryLower) ||
          event.description.toLowerCase().includes(queryLower)
        )
        .map(event => ({
          ...event,
          type: 'Events',
        }));
    }

    setSearchResults({
      Corporate: corporateResults,
      People: peopleResults,
      Events: eventsResults,
    });
  }, []);

  useEffect(() => {
    // Load events if needed
    // dispatch(fetchAllEvents());
    
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

  useEffect(() => {
    if (showFilterOverlay) return;
    if (isSearchFocused || searchQuery.trim() !== '') {
      setIsSearching(true);
      performSearch(searchQuery);
    } else {
      setIsSearching(false);
      setShowFilterOverlay(false);
      setSearchResults({ Corporate: [], People: [], Events: [] });
      setActiveSearchFilter('Corporate');
    }
  }, [searchQuery, isSearchFocused, performSearch, showFilterOverlay]);

  const onRefresh = async () => {
    setRefreshing(true);
    // await dispatch(fetchAllEvents());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBackPress = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
    setIsSearching(false);
    setShowFilterOverlay(false);
    setSearchResults({ Corporate: [], People: [], Events: [] });
    setActiveSearchFilter('Corporate');
  };

  const getFilteredEvents = () => {
    let filtered = [...dummyEvents];

    // Filter by tab
    if (activeTab === 'registered') {
      filtered = filtered.filter(event => event.isRegistered);
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => event.isUpcoming);
    }

    // Filter by search query
    if (searchQuery.trim() && !isSearching) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const renderEventItem = useCallback(
    ({ item }) => (
      <EventCard
        event={item}
        onPress={() => console.log('Event pressed:', item.id)}
      />
    ),
    []
  );

  const renderSearchResultItem = useCallback(
    ({ item }) => {
      if (item.type === 'Events') {
        return <EventCard event={item} compact={true} onPress={() => console.log('Event pressed:', item.id)} />;
      }
      
      return (
        <TouchableOpacity style={styles.searchResultItem}>
          <View style={styles.searchResultIcon}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.searchResultAvatar} />
            ) : item.type === 'People' ? (
              <View style={styles.searchResultIconPlaceholder}>
                <Text style={styles.searchResultIconText}>
                  {item.name?.[0]?.toUpperCase() || 'P'}
                </Text>
              </View>
            ) : (
              <View style={styles.searchResultIconPlaceholder}>
                <Ionicons 
                  name={item.icon || 'business'} 
                  size={20} 
                  color={colors.primary} 
                />
              </View>
            )}
          </View>
          <Text style={styles.searchResultName}>{item.name}</Text>
        </TouchableOpacity>
      );
    },
    []
  );

  const applyFiltersToResults = (results) => {
    let filtered = [...results];

    if (appliedFilters.fromDate) {
      // Filter by from date
    }
    if (appliedFilters.toDate) {
      // Filter by to date
    }
    if (appliedFilters.location) {
      // Filter by location
    }

    return filtered;
  };

  const renderSearchResults = () => {
    let displayResults = [];
    
    // For "protest" search, show combined results in exact Figma order when Corporate tab is active
    if (searchQuery.toLowerCase().includes('protest')) {
      if (activeSearchFilter === 'Corporate') {
        // Figma shows exact order: 21 Industries, Darcy Patterson, Alex Hamilton, Bowen Group, Taylor Smith
        const orderedNames = ['21 Industries', 'Darcy Patterson', 'Alex Hamilton', 'Bowen Group', 'Taylor Smith'];
        const corporateResults = searchResults.Corporate || [];
        const peopleResults = searchResults.People || [];
        
        // Get items in exact order from Figma
        displayResults = orderedNames.map(name => {
          let found = corporateResults.find(item => item.name === name);
          if (!found) {
            found = peopleResults.find(item => item.name === name);
          }
          return found;
        }).filter(Boolean);
        
        // Add remaining Corporate results after the ordered ones
        const remainingCorporate = corporateResults.filter(item => 
          !orderedNames.includes(item.name)
        );
        displayResults = [...displayResults, ...remainingCorporate];
      } else {
        // For People and Events filters, show results from that category
        displayResults = searchResults[activeSearchFilter] || [];
      }
    } else {
      // For other searches, show results from active filter
      displayResults = searchResults[activeSearchFilter] || [];
    }

    displayResults = applyFiltersToResults(displayResults);

    if (displayResults.length === 0) {
      return (
        <View style={styles.searchEmptyState}>
          <Text style={styles.searchEmptyStateText}>No results found.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={displayResults}
        keyExtractor={(item) => item.id}
        renderItem={renderSearchResultItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.searchResultsList}
      />
    );
  };

  const handleResetFilters = () => {
    setFilterValues({ fromDate: '', toDate: '', location: '' });
    setAppliedFilters({ fromDate: '', toDate: '', location: '' });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setShowFilterOverlay(false);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (appliedFilters.fromDate) count++;
    if (appliedFilters.toDate) count++;
    if (appliedFilters.location) count++;
    return count;
  };

  const renderHeader = () => (
    <View style={styles.fixedHeader}>
      {/* App Header - Hide when searching */}
      {!isSearching && (
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
      )}

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
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              if (searchQuery.trim() === '') {
                setIsSearchFocused(false);
              }
            }}
            autoFocus={isSearching}
          />
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

      {/* Filter Tabs - Show when searching */}
      {isSearching && (
        <View style={styles.filterTabsContainer}>
          {SEARCH_FILTER_TABS.map((tab) => {
            const count = searchResults[tab.key]?.length || 0;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.filterTab}
                onPress={() => setActiveSearchFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeSearchFilter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label} {count}
                </Text>
                {activeSearchFilter === tab.key && (
                  <View style={styles.filterTabUnderline} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Event Filter Tabs - Show when not searching */}
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
    
    if (activeTab === 'upcoming' && filteredEvents.length === 0) {
      return <EmptyState message="No upcoming events" />;
    }
    
    return (
      <EmptyState message="No events found" />
    );
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
        <>
          {isSearching ? (
            renderSearchResults()
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item.id}
              renderItem={renderEventItem}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
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
            {/* Filter Tabs */}
            <View style={styles.filterOverlayTabs}>
              {SEARCH_FILTER_TABS.map((tab) => {
                const count = searchResults[tab.key]?.length || 0;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.filterOverlayTab}
                    onPress={() => setActiveSearchFilter(tab.key)}
                  >
                    <Text
                      style={[
                        styles.filterOverlayTabText,
                        activeSearchFilter === tab.key && styles.filterOverlayTabTextActive,
                      ]}
                    >
                      {tab.label} {count}
                    </Text>
                    {activeSearchFilter === tab.key && (
                      <View style={styles.filterOverlayTabUnderline} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Filter Content */}
            <View style={styles.filterContent}>
              {/* Show entity list when Corporate tab is active */}
              {activeSearchFilter === 'Corporate' && (
                <View style={styles.filterEntityList}>
                  {searchResults.Corporate.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.filterEntityItem}>
                      <View style={styles.filterEntityIcon}>
                        <Ionicons 
                          name={item.icon || 'business'} 
                          size={20} 
                          color={colors.primary} 
                        />
                      </View>
                      <Text style={styles.filterEntityName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {searchResults.People.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.filterEntityItem}>
                      <View style={styles.filterEntityIcon}>
                        <Text style={styles.filterEntityIconText}>
                          {item.name?.[0]?.toUpperCase() || 'P'}
                        </Text>
                      </View>
                      <Text style={styles.filterEntityName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.filterSectionTitle}>Filter by:</Text>
              
              {/* From Date */}
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>From</Text>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => {
                    // Open date picker
                    const date = new Date();
                    date.setDate(date.getDate() + 1);
                    setFilterValues({
                      ...filterValues,
                      fromDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                    });
                  }}
                >
                  <Text style={[styles.filterInputText, !filterValues.fromDate && styles.filterInputPlaceholder]}>
                    {filterValues.fromDate || '09-10-2025'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* To Date */}
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>To</Text>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => {
                    // Open date picker
                    const date = new Date();
                    date.setDate(date.getDate() + 2);
                    setFilterValues({
                      ...filterValues,
                      toDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                    });
                  }}
                >
                  <Text style={[styles.filterInputText, !filterValues.toDate && styles.filterInputPlaceholder]}>
                    {filterValues.toDate || '09-11-2025'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Location</Text>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => {
                    // Open location picker
                    setFilterValues({
                      ...filterValues,
                      location: 'New York, USA',
                    });
                  }}
                >
                  <Text style={[styles.filterInputText, !filterValues.location && styles.filterInputPlaceholder]}>
                    {filterValues.location || 'Select location'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  searchContainerActive: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
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
  filterTabsContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  filterTabText: {
    fontSize: fontSize.md,
    color: '#6B7280',
    fontWeight: '400',
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterTabUnderline: {
    position: 'absolute',
    bottom: -spacing.sm - 1,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
  
  // Event Card Styles
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  eventImageContainer: {
    height: 180,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    padding: spacing.md,
  },
  eventTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.sm,
  },
  eventDescription: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  eventInfo: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfoLabel: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    marginRight: spacing.xs,
  },
  eventInfoValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#000000',
  },
  eventStatus: {
    color: '#EF4444',
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 200,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Search Results
  searchResultsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: spacing.md,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchResultIconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultAvatar: {
    width: '100%',
    height: '100%',
  },
  searchResultName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  searchEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    minHeight: 300,
  },
  searchEmptyStateText: {
    fontSize: fontSize.lg,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Compact Event Card for Search Results
  eventCardCompact: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: spacing.md,
  },
  eventImageContainerCompact: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  eventImageCompact: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholderCompact: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContentCompact: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTitleCompact: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.xs,
  },
  eventDescriptionCompact: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  eventInfoCompact: {
    gap: 2,
  },
  eventModeCompact: {
    fontSize: fontSize.xs,
    color: '#10B981',
  },
  eventStatusCompact: {
    fontSize: fontSize.xs,
    color: '#EF4444',
  },
  searchResultIconText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
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
  filterOverlayTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: spacing.lg,
  },
  filterOverlayTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  filterOverlayTabText: {
    fontSize: fontSize.md,
    color: '#6B7280',
    fontWeight: '400',
  },
  filterOverlayTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterOverlayTabUnderline: {
    position: 'absolute',
    bottom: -spacing.sm - 1,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  filterEntityList: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterEntityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  filterEntityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterEntityIconText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  filterEntityName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  filterSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.sm,
  },
  filterField: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: spacing.xs,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterInputText: {
    fontSize: fontSize.md,
    color: '#000000',
    flex: 1,
  },
  filterInputPlaceholder: {
    color: '#9CA3AF',
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
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

export default EventsScreen;

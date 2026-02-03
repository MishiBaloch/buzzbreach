import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllEvents, setFilter } from '../../store/slices/eventsSlice';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import { LoadingSpinner } from '../../components/common/Loading';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
];

// Event Card Component
const EventCard = ({ event, onPress }) => {
  const eventDate = new Date(event.eventDate || event.date || event.startDate);
  
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.eventImageContainer}>
        {event.image || event.imageUrl ? (
          <Image source={{ uri: event.image || event.imageUrl }} style={styles.eventImage} />
        ) : (
          <View style={styles.eventImagePlaceholder}>
            <Ionicons name="calendar" size={40} color={colors.primary} />
          </View>
        )}
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateDay}>
            {isNaN(eventDate.getDate()) ? '01' : eventDate.getDate()}
          </Text>
          <Text style={styles.eventDateMonth}>
            {isNaN(eventDate.getMonth()) 
              ? 'Jan' 
              : eventDate.toLocaleString('default', { month: 'short' })}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title || event.name || 'Event Title'}
        </Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.eventMetaText} numberOfLines={1}>
              {event.location || event.venue || 'Online'}
            </Text>
          </View>
          
          <View style={styles.eventMetaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.eventMetaText}>
              {event.time || event.startTime || 'TBD'}
            </Text>
          </View>
        </View>
        
        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        
        <View style={styles.eventFooter}>
          <View style={styles.attendeesInfo}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={styles.attendeesText}>
              {event.attendees || event.registeredCount || 0} attending
            </Text>
          </View>
          
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component
const EmptyState = ({ message, onAction, actionLabel }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
    <Text style={styles.emptyTitle}>No Events Found</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {onAction && actionLabel && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
        <Text style={styles.emptyButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const EventsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, isLoading, filter } = useSelector((state) => state.events);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    dispatch(fetchAllEvents());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllEvents());
    setRefreshing(false);
  };

  const handleFilterChange = (filterKey) => {
    dispatch(setFilter(filterKey));
  };

  const getFilteredEvents = () => {
    if (!events || !Array.isArray(events)) return [];
    if (filter === 'all') return events;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events.filter((event) => {
      const eventDate = new Date(event.eventDate || event.date || event.startDate);
      if (isNaN(eventDate.getTime())) return filter === 'all';
      
      const eventDay = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );

      switch (filter) {
        case 'today':
          return eventDay.getTime() === today.getTime();
        case 'thisWeek': {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return eventDay >= today && eventDay <= weekEnd;
        }
        case 'thisMonth': {
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          return eventDay >= today && eventDay <= monthEnd;
        }
        default:
          return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  const renderEventItem = useCallback(
    ({ item }) => (
      <EventCard
        event={item}
        onPress={() => console.log('Event pressed:', item._key || item._id)}
      />
    ),
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title Row */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTERS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterTab, filter === item.key && styles.filterTabActive]}
            onPress={() => handleFilterChange(item.key)}
          >
            <Text
              style={[styles.filterText, filter === item.key && styles.filterTextActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Upcoming Events</Text>
        <Text style={styles.resultsCount}>{filteredEvents.length} events</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        message={
          filter === 'all'
            ? 'There are no upcoming events at the moment.'
            : `No events scheduled for ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}.`
        }
        actionLabel={filter !== 'all' ? 'View All Events' : 'Refresh'}
        onAction={filter !== 'all' ? () => handleFilterChange('all') : loadEvents}
      />
    );
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
          data={filteredEvents}
          keyExtractor={(item) => item._key || item._id || Math.random().toString()}
          renderItem={renderEventItem}
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
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
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
  
  // Event Card Styles
  eventCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventImageContainer: {
    height: 160,
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
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 50,
  },
  eventDateDay: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  eventDateMonth: {
    fontSize: fontSize.xs,
    color: colors.white,
    textTransform: 'uppercase',
  },
  eventContent: {
    padding: spacing.md,
  },
  eventTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  eventDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  registerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
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

export default EventsScreen;

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import Card from '../common/Card';
import Badge from '../common/Badge';

const EventCard = ({
  event,
  onPress,
  variant = 'default', // 'default', 'compact'
  style,
}) => {
  const {
    eventName,
    eventType,
    eventDate,
    eventTime,
    eventEndTime,
    venue,
    description,
    eventImage,
    corporate,
    isOnline,
    meetingLink,
  } = event;

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isThisWeek(date)) return format(date, 'EEEE');
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getEventTypeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'webinar':
        return 'info';
      case 'workshop':
        return 'success';
      case 'conference':
        return 'warning';
      case 'networking':
        return 'primary';
      default:
        return 'default';
    }
  };

  const renderDefaultVariant = () => (
    <Card variant="elevated" padding="none" onPress={onPress} style={[styles.card, style]}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        {eventImage ? (
          <Image
            source={{ uri: eventImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="calendar" size={40} color={colors.gray400} />
          </View>
        )}
        {eventType && (
          <View style={styles.typeBadgeContainer}>
            <Badge
              label={eventType}
              variant={getEventTypeVariant(eventType)}
              size="small"
            />
          </View>
        )}
      </View>

      {/* Event Details */}
      <View style={styles.content}>
        <Text style={styles.eventName} numberOfLines={2}>
          {eventName}
        </Text>

        {corporate?.corporateName && (
          <Text style={styles.organizer} numberOfLines={1}>
            By {corporate.corporateName}
          </Text>
        )}

        <View style={styles.detailsContainer}>
          {/* Date & Time */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondary} />
            <Text style={styles.detailText}>
              {formatEventDate(eventDate)}
              {eventTime && ` • ${formatTime(eventTime)}`}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <Ionicons
              name={isOnline ? 'videocam-outline' : 'location-outline'}
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {isOnline ? 'Online Event' : venue || 'Location TBA'}
            </Text>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={onPress}>
          <Text style={styles.registerButtonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderCompactVariant = () => (
    <Card variant="outlined" padding="medium" onPress={onPress} style={[styles.compactCard, style]}>
      <View style={styles.compactContent}>
        <View style={styles.compactDateBox}>
          <Text style={styles.compactMonth}>
            {eventDate ? format(parseISO(eventDate), 'MMM').toUpperCase() : '---'}
          </Text>
          <Text style={styles.compactDay}>
            {eventDate ? format(parseISO(eventDate), 'd') : '--'}
          </Text>
        </View>

        <View style={styles.compactInfo}>
          <Text style={styles.compactEventName} numberOfLines={1}>
            {eventName}
          </Text>
          <View style={styles.compactDetailRow}>
            <Ionicons name="time-outline" size={12} color={colors.gray500} />
            <Text style={styles.compactDetailText}>
              {formatTime(eventTime)}
            </Text>
          </View>
          <View style={styles.compactDetailRow}>
            <Ionicons
              name={isOnline ? 'videocam-outline' : 'location-outline'}
              size={12}
              color={colors.gray500}
            />
            <Text style={styles.compactDetailText} numberOfLines={1}>
              {isOnline ? 'Online' : venue || 'TBA'}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </View>
    </Card>
  );

  return variant === 'compact' ? renderCompactVariant() : renderDefaultVariant();
};

const styles = StyleSheet.create({
  // Default Variant
  card: {
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    backgroundColor: colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  typeBadgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  eventName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  organizer: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: borderRadius.lg,
  },
  registerButtonText: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },

  // Compact Variant
  compactCard: {
    marginVertical: spacing.xs,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactDateBox: {
    width: 50,
    height: 50,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactMonth: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.secondary,
  },
  compactDay: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.secondary,
  },
  compactInfo: {
    flex: 1,
  },
  compactEventName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  compactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  compactDetailText: {
    fontSize: fontSize.xs,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
});

export default EventCard;

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import Card from '../common/Card';
import Badge from '../common/Badge';

const JobCard = ({
  job,
  onPress,
  onCompanyPress,
  variant = 'list', // 'list', 'card'
  style,
}) => {
  const {
    jobTitle,
    corporate,
    city,
    state,
    skills = [],
    jobType,
    workLocation,
    createdAt,
  } = job;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const renderListVariant = () => (
    <Card variant="outlined" padding="medium" onPress={onPress} style={[styles.listCard, style]}>
      <View style={styles.listContent}>
        <TouchableOpacity onPress={onCompanyPress} style={styles.logoContainer}>
          {corporate?.logo ? (
            <Image
              source={{ uri: corporate.logo }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="business" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.listInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobTitle}
          </Text>
          
          <TouchableOpacity onPress={onCompanyPress}>
            <Text style={styles.companyName} numberOfLines={1}>
              {corporate?.corporateName}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {city && state ? `${city}, ${state}` : 'Remote'}
            </Text>
          </View>

          {skills.length > 0 && (
            <View style={styles.skillsRow}>
              {skills.slice(0, 3).map((skill, index) => (
                <Badge
                  key={index}
                  label={skill}
                  variant="success"
                  size="small"
                  style={styles.skillBadge}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.listActions}>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderCardVariant = () => (
    <Card variant="elevated" padding="medium" onPress={onPress} style={[styles.gridCard, style]}>
      <View style={styles.cardHeader}>
        {corporate?.logo ? (
          <Image
            source={{ uri: corporate.logo }}
            style={styles.cardLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.logoPlaceholder, styles.cardLogo]}>
            <Ionicons name="business" size={28} color={colors.primary} />
          </View>
        )}
      </View>

      <Text style={styles.cardJobTitle} numberOfLines={2}>
        {jobTitle}
      </Text>
      
      <Text style={styles.cardCompanyName} numberOfLines={1}>
        {corporate?.corporateName}
      </Text>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
        <Text style={styles.cardLocationText} numberOfLines={1}>
          {city && state ? `${city}, ${state}` : 'Remote'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.cardViewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return variant === 'list' ? renderListVariant() : renderCardVariant();
};

const styles = StyleSheet.create({
  // List Variant
  listCard: {
    marginVertical: spacing.xs,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.xs / 2,
    textTransform: 'capitalize',
  },
  companyName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  skillBadge: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  listActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  viewButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  viewButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },

  // Card/Grid Variant
  gridCard: {
    flex: 1,
    margin: spacing.xs,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardLogo: {
    width: 48,
    height: 48,
  },
  cardJobTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  cardCompanyName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  cardLocationText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  cardFooter: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  cardViewButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
});

export default JobCard;

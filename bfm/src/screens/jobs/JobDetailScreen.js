import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchJobById } from '../../store/slices/jobsSlice';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { LoadingScreen } from '../../components/common/Loading';

const JobDetailScreen = ({ route, navigation }) => {
  const { jobId, job: initialJob } = route.params;
  const dispatch = useDispatch();
  const { selectedJob, isLoading } = useSelector((state) => state.jobs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const job = selectedJob || initialJob;

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [jobId]);

  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to apply for this job.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('ApplyJob', { job });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job: ${job?.jobTitle} at ${job?.corporate?.corporateName}`,
        title: job?.jobTitle,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (isLoading && !job) {
    return <LoadingScreen message="Loading job details..." />;
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.gray400} />
          <Text style={styles.errorText}>Job not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with company info */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.companySection}
            onPress={() =>
              navigation.navigate('CompanyProfile', {
                companyId: job.corporate?.corporateId,
              })
            }
          >
            {job.corporate?.logo ? (
              <Image
                source={{ uri: job.corporate.logo }}
                style={styles.companyLogo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={32} color={colors.secondary} />
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{job.corporate?.corporateName}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.gray500} />
                <Text style={styles.locationText}>
                  {job.city && job.state ? `${job.city}, ${job.state}` : 'Remote'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Job Title */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{job.jobTitle}</Text>
          <View style={styles.badgesRow}>
            {job.jobType && (
              <Badge label={job.jobType} variant="primary" size="medium" style={styles.badge} />
            )}
            {job.workLocation && (
              <Badge label={job.workLocation} variant="info" size="medium" style={styles.badge} />
            )}
            {job.experienceLevel && (
              <Badge
                label={job.experienceLevel}
                variant="success"
                size="medium"
                style={styles.badge}
              />
            )}
          </View>
        </View>

        {/* Quick Info */}
        <Card variant="outlined" padding="medium" style={styles.quickInfoCard}>
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="cash-outline" size={20} color={colors.secondary} />
              <Text style={styles.quickInfoLabel}>Salary</Text>
              <Text style={styles.quickInfoValue}>
                {job.salary || job.salaryRange || 'Not disclosed'}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="briefcase-outline" size={20} color={colors.secondary} />
              <Text style={styles.quickInfoLabel}>Experience</Text>
              <Text style={styles.quickInfoValue}>
                {job.experience || job.experienceRequired || 'Any'}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={20} color={colors.secondary} />
              <Text style={styles.quickInfoLabel}>Type</Text>
              <Text style={styles.quickInfoValue}>{job.jobType || 'Full-time'}</Text>
            </View>
          </View>
        </Card>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill, index) => (
                <Badge
                  key={index}
                  label={skill}
                  variant="success"
                  size="medium"
                  style={styles.skillBadge}
                />
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>
            {job.jobDescription || job.description || 'No description available.'}
          </Text>
        </View>

        {/* Requirements */}
        {job.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.description}>{job.requirements}</Text>
          </View>
        )}

        {/* Benefits */}
        {job.benefits && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <Text style={styles.description}>{job.benefits}</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Apply Button - Fixed at bottom */}
      <View style={styles.applyContainer}>
        <Button
          title="Apply Now"
          onPress={handleApply}
          fullWidth
          size="large"
          icon={<Ionicons name="paper-plane" size={20} color={colors.white} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  companySection: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  companyName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    padding: spacing.lg,
    paddingTop: 0,
    backgroundColor: colors.white,
  },
  jobTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickInfoCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.gray200,
  },
  quickInfoLabel: {
    fontSize: fontSize.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  quickInfoValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  applyContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  errorButton: {
    minWidth: 150,
  },
});

export default JobDetailScreen;

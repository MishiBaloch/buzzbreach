import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logoutAsync } from '../../store/slices/authSlice';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import { LoadingOverlay } from '../../components/common/Loading';
import userService from '../../api/services/userService';

const TABS = [
  { key: 'about', label: 'About', icon: 'person-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('about');
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    try {
      const result = await userService.getUserDetails();
      if (result.success) {
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await dispatch(logoutAsync());
          setLoggingOut(false);
          // Navigate to welcome screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={colors.textMuted} />
          <Text style={styles.loginTitle}>Sign In Required</Text>
          <Text style={styles.loginMessage}>
            Please sign in to view your profile and access all features.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profile = userProfile || user;

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'Not provided'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>User Type</Text>
            <Text style={styles.infoValue}>{profile?.userType || 'Individual'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
          </View>
        </View>
        
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {profile?.city && profile?.country
                ? `${profile.city}, ${profile.country}`
                : 'Not provided'}
            </Text>
          </View>
        </View>
      </View>

      {/* Professional Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Professional Profile</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>
              {profile?.workExperience || 'Not provided'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="school-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Education</Text>
            <Text style={styles.infoValue}>{profile?.education || 'Not provided'}</Text>
          </View>
        </View>
        
        {profile?.skills?.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.skillsLabel}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={20} color={colors.primary} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsCard}>
        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => navigation.navigate('AccountPreferences')}
        >
          <View style={styles.settingsIconContainer}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIconContainer}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => navigation.navigate('DataPrivacy')}
        >
          <View style={styles.settingsIconContainer}>
            <Ionicons name="shield-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Data privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => navigation.navigate('Visibility')}
        >
          <View style={styles.settingsIconContainer}>
            <Ionicons name="eye-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Visibility</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.settingsIconContainer}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIconContainer}>
            <Ionicons name="headset-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Help center</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIconContainer}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.settingsText}>Privacy policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingsItem, styles.logoutItem]} 
          onPress={handleLogout}
        >
          <View style={[styles.settingsIconContainer, styles.logoutIconContainer]}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
          </View>
          <Text style={[styles.settingsText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>BuzzBreach v1.0.0</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return renderAboutTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderAboutTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor="#F3F4F6"
          />
        }
      >
        {/* Header with Profile Info */}
        <View style={styles.header}>
          <View style={styles.headerProfile}>
            <View style={styles.headerAvatarContainer}>
              {profile?.profileImg || profile?.profilePicture ? (
                <Image 
                  source={{ uri: profile.profileImg || profile.profilePicture }} 
                  style={styles.headerAvatar} 
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarText}>
                    {profile?.firstName?.charAt(0)?.toUpperCase() || 
                     profile?.lastName?.charAt(0)?.toUpperCase() || 
                     profile?.email?.charAt(0)?.toUpperCase() || 
                     'U'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.headerName}>
              {profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}`
                : profile?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      <LoadingOverlay visible={loggingOut} message="Logging out..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatarContainer: {
    marginRight: spacing.md,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  headerName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'capitalize',
  },
  profileHeadline: {
    fontSize: fontSize.md,
    color: '#6B7280',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: '#000000',
    marginTop: 2,
  },
  skillsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skillsLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  skillText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  editButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingsText: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutText: {
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loginTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.lg,
  },
  loginMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  loginButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ProfileScreen;

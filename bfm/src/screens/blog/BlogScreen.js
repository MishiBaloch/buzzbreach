import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';
import userService from '../../api/services/userService';
import BlogDetailScreen from './BlogDetailScreen';

// Image imports - using require for local assets
const image1b = require('../../../assets/1b.jpg');
const image1c = require('../../../assets/1c.jpg');

const { width } = Dimensions.get('window');

const BlogScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showBlogDetail, setShowBlogDetail] = useState(false);

  // Mock blog posts matching Figma design exactly
  const mockBlogPosts = [
    {
      id: '1',
      title: 'Mindfulness and Meditation: \'Mastering M...',
      author: 'Amin A. Toussaint',
      date: 'updated Jan 4, 2022',
      image: image1b,
      category: 'Mindfulness',
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Augmented Reality Trends for 2022',
      author: 'Tech Writer',
      date: 'updated Jan 4, 2022',
      image: null,
      category: 'Technology',
      isFeatured: false,
      views: null,
    },
    {
      id: '3',
      title: 'Stocks making the biggest moves midday: Tesla...',
      author: 'Finance Expert',
      date: 'updated Jan 1, 2022',
      image: null,
      category: 'Business',
      isFeatured: false,
      views: 9823,
    },
    {
      id: '4',
      title: 'Augmented Reality Trends for 2',
      author: 'Tech Writer',
      date: 'updated Jan 4, 2022',
      image: null,
      category: 'Technology',
      isFeatured: false,
      views: null,
    },
  ];

  useEffect(() => {
    setBlogPosts(mockBlogPosts);
    setLoading(false);
    
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

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderFeaturedPost = () => {
    const featuredPost = mockBlogPosts.find(post => post.isFeatured);
    if (!featuredPost) return null;

    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Posts</Text>
        <TouchableOpacity 
          style={styles.featuredCard} 
          activeOpacity={0.8}
          onPress={() => {
            setSelectedPost(featuredPost);
            setShowBlogDetail(true);
          }}
        >
          <View style={styles.featuredImageContainer}>
            {featuredPost.image ? (
              <Image source={featuredPost.image} style={styles.featuredImage} />
            ) : (
              <View style={styles.featuredImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {featuredPost.title}
            </Text>
            <Text style={styles.featuredAuthor}>{featuredPost.author}</Text>
            <Text style={styles.featuredDate}>{featuredPost.date}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLatestPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.latestCard} 
      activeOpacity={0.8}
      onPress={() => {
        setSelectedPost(item);
        setShowBlogDetail(true);
      }}
    >
      <View style={styles.latestContent}>
        <View style={styles.latestHeader}>
          <View style={[styles.categoryTag, item.category === 'Technology' && styles.technologyTag, item.category === 'Business' && styles.businessTag]}>
            <Text style={[styles.categoryTagText, item.category === 'Technology' && styles.technologyTagText, item.category === 'Business' && styles.businessTagText]}>
              {item.category}
            </Text>
          </View>
          {item.views && (
            <Text style={styles.viewsText}>{item.views} views</Text>
          )}
        </View>
        <Text style={styles.latestTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.latestDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
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
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const latestPosts = mockBlogPosts.filter(post => !post.isFeatured);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Fixed Header Section - Not Scrollable */}
      {renderHeader()}

      <FlatList
        data={latestPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderLatestPost}
        ListHeaderComponent={renderFeaturedPost}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No blog posts yet</Text>
            <Text style={styles.emptyStateSubtitle}>Check back later for new articles</Text>
          </View>
        }
      />

      {/* Blog Detail Overlay */}
      <Modal
        visible={showBlogDetail}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBlogDetail(false)}
      >
        <View style={styles.overlayContainer}>
          <BlogDetailScreen
            blogPost={selectedPost}
            onClose={() => {
              setShowBlogDetail(false);
              setSelectedPost(null);
            }}
          />
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
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
  featuredSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.md,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: spacing.md,
  },
  featuredImageContainer: {
    width: '100%',
    height: 200,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredContent: {
    padding: spacing.md,
  },
  featuredTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.xs,
  },
  featuredAuthor: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    marginBottom: 2,
  },
  featuredDate: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
  },
  latestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  latestContent: {
    gap: spacing.xs,
  },
  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  technologyTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  businessTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  categoryTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  technologyTagText: {
    color: '#3B82F6',
  },
  businessTagText: {
    color: '#10B981',
  },
  latestTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  latestDate: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
  },
  viewsText: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default BlogScreen;

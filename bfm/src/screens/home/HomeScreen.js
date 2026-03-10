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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';
import userService from '../../api/services/userService';
import PostViewScreen from './PostViewScreen';
import NotificationsScreen from './NotificationsScreen';
import MessagesListScreen from './MessagesListScreen';
import ChatScreen from './ChatScreen';

const { width } = Dimensions.get('window');

// Image imports - using require for local assets (moved outside component)
const image1b = require('../../../assets/1b.jpg');
const image1c = require('../../../assets/1c.jpg');

// Post Card Component
const PostCard = ({ post, userProfile, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => onPress && onPress(post)}
      activeOpacity={0.95}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.postAvatar}>
            {post.userAvatar ? (
              <Image source={{ uri: post.userAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {post.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.postUserDetails}>
            <Text style={styles.postUsername}>{post.username || 'User'}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.heartEmoji}>💛</Text>
              <Text style={styles.postTime}>{formatTimeAgo(post.createdAt || post.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postText}>{post.content || post.text || 'No content'}</Text>

      {/* Post Image */}
      {post.image && (
        <View style={styles.postImageContainer}>
          <Image 
            source={post.image}
            style={styles.postImage} 
            resizeMode="cover" 
            onError={(error) => {
              console.log('Image load error:', error);
            }}
          />
        </View>
      )}

      {/* Engagement Metrics */}
      <View style={styles.engagementRow}>
        <TouchableOpacity 
          style={styles.engagementButton}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={20} 
            color={liked ? "#EF4444" : colors.textMuted} 
          />
          <Text style={styles.engagementText}>
            {formatNumber(post.likes || 69900)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engagementButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={styles.engagementText}>
            {formatNumber(post.comments || 5230)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engagementButton}>
          <Ionicons name="paper-plane-outline" size={20} color={colors.textMuted} />
          <Text style={styles.engagementText}>
            {formatNumber(post.shares || 3570)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={() => setBookmarked(!bookmarked)}
        >
          <Ionicons 
            name={bookmarked ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={bookmarked ? colors.primary : colors.textMuted} 
          />
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <View style={styles.commentAvatar}>
          {userProfile?.profilePicture ? (
            <Image source={{ uri: userProfile.profilePicture }} style={styles.commentAvatarImage} />
          ) : (
            <View style={styles.commentAvatarPlaceholder}>
              <Text style={styles.commentAvatarText}>
                {userProfile?.firstName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'S'}
              </Text>
            </View>
          )}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
          editable={false}
        />
        <TouchableOpacity style={styles.commentEmojiButton}>
          <Ionicons name="happy-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Corporate'); // Corporate, People, Events
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [searchResults, setSearchResults] = useState({
    Corporate: [],
    People: [],
    Events: [],
  });
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [filterValues, setFilterValues] = useState({
    postedAt: '',
    contentType: '',
    hashTag: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    postedAt: '',
    contentType: '',
    hashTag: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showHashTagDropdown, setShowHashTagDropdown] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostView, setShowPostView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessagesList, setShowMessagesList] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChat, setShowChat] = useState(false);
  
  // Filter options
  const contentTypeOptions = ['Post', 'Image', 'Video', 'Link', 'Poll'];
  const hashTagOptions = ['#protest', '#climate', '#social', '#tech', '#business', '#innovation'];

  // Mock posts data - 10 posts for next 10 days
  const generateMockPosts = () => {
    const today = new Date();
    const posts = [];
    const postContents = [
      {
        username: 'JihyoLovers',
        content: "Just listened to Jihyo's solo track in Twice's latest album and I'm blown away by her powerful vocals! 🔥",
        image: image1b,
        likes: 69900,
        comments: 5230,
        shares: 3570,
      },
      {
        username: 'Virág Mercédesz',
        content: 'When given a mistake, be grateful. When faced with a mistake, be patient. When given something, don\'t ask "Why?" but when faced with loss, ask "How?" We have double standards with God. In the end, our lives become mediocre and stagnant. Ya Rabb!',
        image: image1c,
        likes: 69900,
        comments: 5230,
        shares: 3570,
      },
      {
        username: 'FoodieAdventures',
        content: 'Tried the new Italian restaurant downtown. The pasta was absolutely divine! Highly recommend the carbonara. 🍝✨',
        image: null,
        likes: 8900,
        comments: 567,
        shares: 123,
      },
      {
        username: 'FitnessMotivation',
        content: 'Completed my 30-day fitness challenge! Consistency is key. If I can do it, so can you! 💪 #FitnessGoals #Motivation',
        image: null,
        likes: 23400,
        comments: 1450,
        shares: 678,
      },
      {
        username: 'TechInnovator',
        content: 'Excited to share our latest AI breakthrough! The future of technology is here. 🚀 #AI #Innovation #Tech',
        image: null,
        likes: 15200,
        comments: 890,
        shares: 345,
      },
      {
        username: 'TravelEnthusiast',
        content: 'Just landed in Tokyo! The cherry blossoms are absolutely stunning this season. 🌸 #Travel #Japan #Adventure',
        image: null,
        likes: 28700,
        comments: 1234,
        shares: 567,
      },
      {
        username: 'BookWorm',
        content: 'Finished reading "The Seven Husbands of Evelyn Hugo" - what an incredible story! Highly recommend to all book lovers. 📚',
        image: null,
        likes: 11200,
        comments: 678,
        shares: 234,
      },
      {
        username: 'MusicProducer',
        content: 'New track dropping next week! Been working on this for months. Can\'t wait to share it with you all. 🎵 #Music #NewRelease',
        image: null,
        likes: 18900,
        comments: 987,
        shares: 456,
      },
      {
        username: 'ArtCreator',
        content: 'Just finished my latest digital art piece. The colors came out exactly as I envisioned! 🎨 #DigitalArt #Creative',
        image: null,
        likes: 22100,
        comments: 1456,
        shares: 789,
      },
      {
        username: 'NatureLover',
        content: 'Morning hike in the mountains was exactly what I needed. Nature always has a way of resetting the mind. 🏔️ #Nature #Hiking',
        image: null,
        likes: 16300,
        comments: 890,
        shares: 345,
      },
    ];

    for (let i = 0; i < 10; i++) {
      const postDate = new Date(today);
      postDate.setDate(today.getDate() + i);
      postDate.setHours(9 + i, 30, 0, 0); // Different times each day
      
      const postData = postContents[i % postContents.length];
      posts.push({
        id: `post-${i + 1}`,
        username: postData.username,
        userAvatar: null,
        content: postData.content,
        image: postData.image,
        likes: postData.likes,
        comments: postData.comments,
        shares: postData.shares,
        createdAt: postDate,
      });
    }

    return posts;
  };

  const mockPosts = generateMockPosts();

  // Mock search results - replace with actual API call
  const performSearch = useCallback((query) => {
    if (!query || query.trim() === '') {
      setSearchResults({ Corporate: [], People: [], Events: [] });
      return;
    }

    const queryLower = query.toLowerCase();
    
    // Handle specific category searches
    if (queryLower.includes('event')) {
      // Show events when user types "events" or "event"
      setSearchResults({
        Corporate: [],
        People: [],
        Events: [
          { id: '1', name: 'Tech Conference 2024', avatar: null },
          { id: '2', name: 'Networking Mixer', avatar: null },
          { id: '3', name: 'Industry Summit', avatar: null },
          { id: '4', name: 'Workshop Series', avatar: null },
          { id: '5', name: 'Annual Gala', avatar: null },
          { id: '6', name: 'Startup Pitch Event', avatar: null },
          { id: '7', name: 'Career Fair', avatar: null },
          { id: '8', name: 'Innovation Expo', avatar: null },
          { id: '9', name: 'Leadership Forum', avatar: null },
          { id: '10', name: 'Community Meetup', avatar: null },
          { id: '11', name: 'Product Launch', avatar: null },
          { id: '12', name: 'Hackathon 2024', avatar: null },
          { id: '13', name: 'Panel Discussion', avatar: null },
          { id: '14', name: 'Charity Fundraiser', avatar: null },
          { id: '15', name: 'Music Festival', avatar: null },
        ],
      });
    } else if (queryLower.includes('people') || queryLower.includes('person')) {
      // Show people when user types "people" or "person"
      setSearchResults({
        Corporate: [],
        People: [
          { id: '1', name: 'Sarah Johnson', avatar: null },
          { id: '2', name: 'Michael Chen', avatar: null },
          { id: '3', name: 'Emily Rodriguez', avatar: null },
          { id: '4', name: 'David Kim', avatar: null },
          { id: '5', name: 'Jessica Martinez', avatar: null },
          { id: '6', name: 'Robert Williams', avatar: null },
          { id: '7', name: 'Amanda Brown', avatar: null },
          { id: '8', name: 'James Wilson', avatar: null },
          { id: '9', name: 'Lisa Anderson', avatar: null },
          { id: '10', name: 'Christopher Lee', avatar: null },
          { id: '11', name: 'Michelle Garcia', avatar: null },
          { id: '12', name: 'Daniel Thompson', avatar: null },
          { id: '13', name: 'Jennifer Davis', avatar: null },
          { id: '14', name: 'Matthew Taylor', avatar: null },
          { id: '15', name: 'Nicole White', avatar: null },
        ],
        Events: [],
      });
    } else if (queryLower.includes('corporate') || queryLower.includes('company') || queryLower.includes('corp')) {
      // Show corporate when user types "corporate", "company", or "corp"
      setSearchResults({
        Corporate: [
          { id: '1', name: 'Tech Solutions Inc', avatar: null },
          { id: '2', name: 'Global Industries', avatar: null },
          { id: '3', name: 'Innovation Corp', avatar: null },
          { id: '4', name: 'Digital Ventures', avatar: null },
          { id: '5', name: 'Enterprise Group', avatar: null },
          { id: '6', name: 'Business Partners LLC', avatar: null },
          { id: '7', name: 'Strategic Solutions', avatar: null },
          { id: '8', name: 'Corporate Dynamics', avatar: null },
          { id: '9', name: 'Industry Leaders Co', avatar: null },
          { id: '10', name: 'Professional Services', avatar: null },
          { id: '11', name: 'Market Leaders Inc', avatar: null },
          { id: '12', name: 'Enterprise Solutions', avatar: null },
          { id: '13', name: 'Business Innovations', avatar: null },
          { id: '14', name: 'Corporate Excellence', avatar: null },
          { id: '15', name: 'Strategic Partners', avatar: null },
          { id: '16', name: 'Industry Giants', avatar: null },
          { id: '17', name: 'Business Ventures', avatar: null },
          { id: '18', name: 'Corporate Network', avatar: null },
          { id: '19', name: 'Enterprise Group', avatar: null },
          { id: '20', name: 'Professional Corp', avatar: null },
          { id: '21', name: 'Business Solutions', avatar: null },
          { id: '22', name: 'Corporate Alliance', avatar: null },
          { id: '23', name: 'Industry Partners', avatar: null },
          { id: '24', name: 'Enterprise Solutions', avatar: null },
        ],
        People: [],
        Events: [],
      });
    } else if (queryLower.includes('protest')) {
      // Mock data for "Protest" search - matching Figma design counts
      setSearchResults({
        Corporate: [
          { id: '1', name: '21 Industries', avatar: null },
          { id: '2', name: 'Bowen Group', avatar: null },
          { id: '3', name: 'Protest Solutions Inc', avatar: null },
          { id: '4', name: 'Social Change Corp', avatar: null },
          { id: '5', name: 'Protest Dynamics', avatar: null },
          { id: '6', name: 'Activist Network Co', avatar: null },
          { id: '7', name: 'Movement Partners', avatar: null },
          { id: '8', name: 'Rally Corporation', avatar: null },
          { id: '9', name: 'Change Makers Inc', avatar: null },
          { id: '10', name: 'Protest Hub LLC', avatar: null },
          { id: '11', name: 'Social Impact Group', avatar: null },
          { id: '12', name: 'Advocacy Solutions', avatar: null },
          { id: '13', name: 'Protest Tech Industries', avatar: null },
          { id: '14', name: 'Community Action Corp', avatar: null },
          { id: '15', name: 'Rights Movement Co', avatar: null },
          { id: '16', name: 'Protest Media Group', avatar: null },
          { id: '17', name: 'Activist Ventures', avatar: null },
          { id: '18', name: 'Social Justice Corp', avatar: null },
          { id: '19', name: 'Protest Foundation', avatar: null },
          { id: '20', name: 'Movement Builders Inc', avatar: null },
          { id: '21', name: 'Change Agents LLC', avatar: null },
          { id: '22', name: 'Protest Alliance', avatar: null },
          { id: '23', name: 'Advocacy Network', avatar: null },
          { id: '24', name: 'Rally Solutions', avatar: null },
        ],
        People: [
          { id: '1', name: 'Darcy Patterson', avatar: null },
          { id: '2', name: 'Alex Hamilton', avatar: null },
          { id: '3', name: 'Taylor Smith', avatar: null },
          { id: '4', name: 'Protest Organizer', avatar: null },
          { id: '5', name: 'Jordan Martinez', avatar: null },
          { id: '6', name: 'Morgan Lee', avatar: null },
          { id: '7', name: 'Casey Johnson', avatar: null },
          { id: '8', name: 'Riley Chen', avatar: null },
          { id: '9', name: 'Avery Williams', avatar: null },
          { id: '10', name: 'Quinn Brown', avatar: null },
          { id: '11', name: 'Sage Davis', avatar: null },
          { id: '12', name: 'River Wilson', avatar: null },
          { id: '13', name: 'Phoenix Anderson', avatar: null },
          { id: '14', name: 'Skylar Thompson', avatar: null },
          { id: '15', name: 'Rowan Garcia', avatar: null },
        ],
        Events: [
          { id: '1', name: 'Climate Protest March', avatar: null },
          { id: '2', name: 'Workers Rights Rally', avatar: null },
          { id: '3', name: 'Social Justice Forum', avatar: null },
          { id: '4', name: 'Protest for Change', avatar: null },
          { id: '5', name: 'Rights Awareness March', avatar: null },
          { id: '6', name: 'Community Protest Gathering', avatar: null },
          { id: '7', name: 'Activist Rally 2024', avatar: null },
          { id: '8', name: 'Protest Movement Summit', avatar: null },
          { id: '9', name: 'Social Change Conference', avatar: null },
        ],
      });
    } else {
      // Generic search results - generate some dummy data based on query
      const generateDummyCorporate = (count) => {
        return Array.from({ length: count }, (_, i) => ({
          id: `corp-${i + 1}`,
          name: `${query} Company ${i + 1}`,
          avatar: null,
        }));
      };

      const generateDummyPeople = (count) => {
        const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Thompson'];
        return Array.from({ length: count }, (_, i) => ({
          id: `person-${i + 1}`,
          name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
          avatar: null,
        }));
      };

      const generateDummyEvents = (count) => {
        return Array.from({ length: count }, (_, i) => ({
          id: `event-${i + 1}`,
          name: `${query} Event ${i + 1}`,
          avatar: null,
        }));
      };

      setSearchResults({
        Corporate: generateDummyCorporate(12),
        People: generateDummyPeople(8),
        Events: generateDummyEvents(5),
      });
    }
  }, []);

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      const userResult = await userService.getUserDetails();
      if (userResult.success) {
        setUserProfile(userResult.data);
      }

      // TODO: Replace with actual posts API call
      // For now, using mock data
      setPosts(mockPosts);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debug: Track filter overlay state
  useEffect(() => {
    console.log('Filter overlay state changed:', {
      isSearching,
      showFilterOverlay,
      shouldShowModal: isSearching && showFilterOverlay
    });
  }, [isSearching, showFilterOverlay]);

  // Handle search focus and query changes
  useEffect(() => {
    // Don't reset search state if filter overlay is open - keep search active
    if (showFilterOverlay) {
      return; // Keep search state when filter is open
    }
    
    if (isSearchFocused || searchQuery.trim() !== '') {
      setIsSearching(true);
      if (searchQuery.trim() !== '') {
        const queryLower = searchQuery.toLowerCase();
        
        // Auto-detect filter based on search query
        if (queryLower.includes('event')) {
          setActiveFilter('Events');
        } else if (queryLower.includes('people') || queryLower.includes('person')) {
          setActiveFilter('People');
        } else if (queryLower.includes('corporate') || queryLower.includes('company') || queryLower.includes('corp')) {
          setActiveFilter('Corporate');
        }
        // If query contains "protest", keep Corporate as default (matching Figma)
        
        performSearch(searchQuery);
      } else {
        setSearchResults({ Corporate: [], People: [], Events: [] });
      }
    } else {
      setIsSearching(false);
      setShowFilterOverlay(false);
      setSearchResults({ Corporate: [], People: [], Events: [] });
      setActiveFilter('Corporate'); // Reset to default
    }
  }, [searchQuery, isSearchFocused, performSearch, showFilterOverlay]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    setSearchQuery('');
    setIsSearching(false);
    setIsSearchFocused(false);
    setShowFilterOverlay(false);
    setSearchResults({ Corporate: [], People: [], Events: [] });
  };

  const handleResetFilters = () => {
    setFilterValues({
      postedAt: '',
      contentType: '',
      hashTag: '',
    });
    setAppliedFilters({
      postedAt: '',
      contentType: '',
      hashTag: '',
    });
    setShowContentTypeDropdown(false);
    setShowHashTagDropdown(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setShowFilterOverlay(false);
    // TODO: Apply filters to search results
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (appliedFilters.postedAt) count++;
    if (appliedFilters.contentType) count++;
    if (appliedFilters.hashTag) count++;
    return count;
  };

  const getCurrentFiltersCount = () => {
    let count = 0;
    if (filterValues.postedAt) count++;
    if (filterValues.contentType) count++;
    if (filterValues.hashTag) count++;
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
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={22} color="#000000" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowMessagesList(true)}
            >
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
              // Only blur if search query is empty
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
              console.log('Filter button pressed - opening overlay');
              console.log('isSearching:', isSearching);
              console.log('searchQuery:', searchQuery);
              // Ensure search state stays active
              setIsSearchFocused(true);
              setIsSearching(true);
              // Initialize filter values from applied filters when opening
              setFilterValues({ ...appliedFilters });
              setShowFilterOverlay(true);
              console.log('setShowFilterOverlay(true) called');
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
          <TouchableOpacity
            style={styles.filterTab}
            onPress={() => setActiveFilter('Corporate')}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === 'Corporate' && styles.filterTabTextActive
            ]}>
              Corporate {searchResults.Corporate.length}
            </Text>
            {activeFilter === 'Corporate' && <View style={styles.filterTabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterTab}
            onPress={() => setActiveFilter('People')}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === 'People' && styles.filterTabTextActive
            ]}>
              People {searchResults.People.length}
            </Text>
            {activeFilter === 'People' && <View style={styles.filterTabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterTab}
            onPress={() => setActiveFilter('Events')}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === 'Events' && styles.filterTabTextActive
            ]}>
              Events {searchResults.Events.length}
            </Text>
            {activeFilter === 'Events' && <View style={styles.filterTabUnderline} />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity style={styles.searchResultItem}>
      <View style={styles.searchResultAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.searchResultAvatarImage} />
        ) : (
          <View style={styles.searchResultAvatarPlaceholder}>
            <Text style={styles.searchResultAvatarText}>
              {item.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.searchResultName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const applyFiltersToResults = (results) => {
    if (!results || results.length === 0) return results;

    let filtered = [...results];

    // Filter by Posted At (date)
    // In production, filter by: item.postedAt === appliedFilters.postedAt
    // For now, if date filter is applied, we'll show all results (since mock data doesn't have dates)
    // In real implementation: filtered = filtered.filter(item => item.postedAt === appliedFilters.postedAt);

    // Filter by Content Type
    // In production, filter by: item.contentType === appliedFilters.contentType
    // For now, we'll apply a simple filter based on content type
    if (appliedFilters.contentType) {
      // In real implementation, check item.contentType or item.type
      // For demo purposes, we'll keep all results but this would filter in production
    }

    // Filter by HashTag
    if (appliedFilters.hashTag) {
      // Filter results that might contain the hashtag keyword
      const hashtagKeyword = appliedFilters.hashTag.replace('#', '').toLowerCase();
      filtered = filtered.filter(item => {
        // Check if name contains the hashtag keyword or if it's related
        const nameLower = item.name?.toLowerCase() || '';
        return nameLower.includes(hashtagKeyword) || 
               nameLower.includes('protest') || // For #protest hashtag
               nameLower.includes('climate') || // For #climate hashtag
               nameLower.includes('social') || // For #social hashtag
               nameLower.includes('tech') || // For #tech hashtag
               nameLower.includes('business') || // For #business hashtag
               nameLower.includes('innovation'); // For #innovation hashtag
      });
    }

    return filtered;
  };

  const renderSearchResults = () => {
    let displayResults = [];
    
    // For "protest" search, show combined results in exact Figma order when Corporate tab is active
    if (searchQuery.toLowerCase().includes('protest')) {
      if (activeFilter === 'Corporate') {
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
        displayResults = searchResults[activeFilter] || [];
      }
    } else {
      // For other searches, show results from active filter
      displayResults = searchResults[activeFilter] || [];
    }

    // Apply filters to results
    displayResults = applyFiltersToResults(displayResults);

    const hasResults = displayResults.length > 0;

    if (!hasResults) {
      return (
        <View style={styles.searchEmptyState}>
          <Text style={styles.searchEmptyStateText}>No results found.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={displayResults}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderSearchResultItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.searchResultsList}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Fixed Header Section - Not Scrollable */}
      {renderHeader()}
      
      {/* Search Results or Posts Section */}
      {isSearching ? (
        renderSearchResults()
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              userProfile={userProfile} 
              onPress={(post) => {
                setSelectedPost(post);
                setShowPostView(true);
              }}
            />
          )}
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
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateSubtitle}>Be the first to share something!</Text>
            </View>
          }
        />
      )}

      {/* Filter Overlay - Only show when searching */}
      <Modal
        visible={isSearching && showFilterOverlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          setShowFilterOverlay(false);
        }}
      >
          <View style={styles.filterOverlayBackdrop}>
            <TouchableOpacity 
              style={styles.filterOverlayBackdropTouchable}
              activeOpacity={1}
              onPress={() => {
                console.log('Backdrop pressed - closing overlay');
                setShowFilterOverlay(false);
              }}
            />
            <View 
              style={styles.filterOverlay}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.filterOverlayHeader}>
              <Text style={styles.filterOverlayTitle}>Filter by:</Text>
            </View>

            <ScrollView style={styles.filterOverlayContent} showsVerticalScrollIndicator={false}>
              {/* Posted At */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Posted At</Text>
                <TouchableOpacity 
                  style={styles.filterInput}
                  onPress={() => {
                    // Simple date input - in production, use a proper date picker like @react-native-community/datetimepicker
                    // For now, set today's date or allow manual input
                    const today = new Date();
                    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
                    if (!filterValues.postedAt) {
                      setFilterValues({ ...filterValues, postedAt: formattedDate });
                    } else {
                      // Toggle off if already set
                      setFilterValues({ ...filterValues, postedAt: '' });
                    }
                  }}
                >
                  <Text style={[
                    styles.filterInputText,
                    !filterValues.postedAt && styles.filterInputPlaceholder
                  ]}>
                    {filterValues.postedAt || '09-11-2025'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Content Type */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Content Type</Text>
                <TouchableOpacity 
                  style={styles.filterInput}
                  onPress={() => {
                    setShowContentTypeDropdown(!showContentTypeDropdown);
                    setShowHashTagDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.filterInputText,
                    !filterValues.contentType && styles.filterInputPlaceholder
                  ]}>
                    {filterValues.contentType || 'Select content type'}
                  </Text>
                  <Ionicons 
                    name={showContentTypeDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                {showContentTypeDropdown && (
                  <View style={styles.dropdownContainer}>
                    {contentTypeOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFilterValues({ ...filterValues, contentType: option });
                          setShowContentTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                        {filterValues.contentType === option && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* HashTag */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>HashTag</Text>
                <TouchableOpacity 
                  style={styles.filterInput}
                  onPress={() => {
                    setShowHashTagDropdown(!showHashTagDropdown);
                    setShowContentTypeDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.filterInputText,
                    !filterValues.hashTag && styles.filterInputPlaceholder
                  ]}>
                    {filterValues.hashTag || 'Select hashtag'}
                  </Text>
                  <Ionicons 
                    name={showHashTagDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                {showHashTagDropdown && (
                  <View style={styles.dropdownContainer}>
                    {hashTagOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFilterValues({ ...filterValues, hashTag: option });
                          setShowHashTagDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                        {filterValues.hashTag === option && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Filter Actions */}
            <View style={styles.filterOverlayActions}>
              <TouchableOpacity 
                style={styles.filterResetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.filterResetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterApplyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.filterApplyButtonText}>
                  Apply Filters{getCurrentFiltersCount() > 0 ? `(${getCurrentFiltersCount()})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </Modal>

      {/* Post View Overlay */}
      {showPostView && selectedPost && (
        <View style={styles.overlayContainer}>
          <PostViewScreen
            post={selectedPost}
            userProfile={userProfile}
            onBack={() => {
              setShowPostView(false);
              setSelectedPost(null);
            }}
            onCommentSubmit={(comment) => {
              console.log('New comment:', comment);
            }}
          />
        </View>
      )}

      {/* Notifications Overlay */}
      {showNotifications && (
        <View style={styles.overlayContainer}>
          <NotificationsScreen
            onBack={() => setShowNotifications(false)}
          />
        </View>
      )}

      {/* Messages List Overlay */}
      {showMessagesList && !showChat && (
        <View style={styles.overlayContainer}>
          <MessagesListScreen
            onBack={() => {
              setShowMessagesList(false);
              setSelectedChat(null);
            }}
            onChatSelect={(chat) => {
              setSelectedChat(chat);
              setShowChat(true);
            }}
          />
        </View>
      )}

      {/* Chat Overlay - Show on top of MessagesList */}
      {showChat && selectedChat && showMessagesList && (
        <View style={styles.overlayContainer}>
          <ChatScreen
            chat={selectedChat}
            onBack={() => {
              setShowChat(false);
              setSelectedChat(null);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background matching the image
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom navigation
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
    backgroundColor: '#FFFFFF', // White background matching the image
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5', // Subtle border to separate from scrollable content
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
    color: '#000000', // Black text on white background
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  taglineContainer: {
    marginLeft: 20 + spacing.xs, // Logo width (20) + marginLeft of logoText (spacing.xs)
    marginTop: 1,
  },
  tagline: {
    fontSize: fontSize.xs,
    color: '#6B6B80', // Muted text color
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
    backgroundColor: '#FFFFFF', // White background
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5E5', // Light border for definition
  },
  searchContainerActive: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000', // Black text on white background
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
  filterTabActive: {
    // Active state handled by underline
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
  searchResultsList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  searchResultAvatarImage: {
    width: '100%',
    height: '100%',
  },
  searchResultAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultAvatarText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchResultName: {
    fontSize: fontSize.md,
    color: '#000000',
    fontWeight: '500',
  },
  searchEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.md,
  },
  searchEmptyStateText: {
    fontSize: fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Post Card Styles
  postCard: {
    backgroundColor: '#FFFFFF', // White background for posts matching the image
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderBottomWidth: 0,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF', // White text on avatar
  },
  postUserDetails: {
    flex: 1,
  },
  postUsername: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000', // Black text on white background
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heartEmoji: {
    fontSize: fontSize.sm,
  },
  postTime: {
    fontSize: fontSize.sm,
    color: '#6B6B80', // Muted text color
  },
  postText: {
    fontSize: fontSize.md,
    color: '#000000', // Black text on white background
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postImageContainer: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundCard,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  engagementText: {
    fontSize: fontSize.sm,
    color: '#6B6B80', // Muted text color
    fontWeight: '500',
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5E5', // Light border for definition
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  commentAvatarImage: {
    width: '100%',
    height: '100%',
  },
  commentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  commentInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#000000', // Black text on white background
    paddingVertical: spacing.xs,
  },
  commentEmojiButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Filter Overlay Styles
  filterOverlayBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterOverlayBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterOverlay: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  filterOverlayHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterOverlayTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
  },
  filterOverlayContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: spacing.sm,
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
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
  },
  filterInputPlaceholder: {
    color: '#9CA3AF',
  },
  filterOverlayActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: spacing.md,
  },
  filterResetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#374151',
  },
  filterApplyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: spacing.xs,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: fontSize.md,
    color: '#000000',
  },
});

export default HomeScreen;

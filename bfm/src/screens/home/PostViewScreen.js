import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

const PostViewScreen = ({ post, userProfile, onBack, onCommentSubmit }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      username: 'Jessica Thompson',
      userAvatar: null,
      content: 'I had so much fun reading this. Insightful!',
      likes: 28,
      timeAgo: '2m ago',
    },
    {
      id: '2',
      username: 'Michael Chen',
      userAvatar: null,
      content: 'Great post! Thanks for sharing.',
      likes: 15,
      timeAgo: '5m ago',
    },
  ]);

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

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        username: userProfile?.firstName || 'You',
        userAvatar: null,
        content: commentText,
        likes: 0,
        timeAgo: 'Just now',
      };
      setComments([newComment, ...comments]);
      setCommentText('');
      if (onCommentSubmit) {
        onCommentSubmit(newComment);
      }
    }
  };

  if (!post) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POST</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Post Content */}
        <View style={styles.postContainer}>
          {/* User Info */}
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

          {/* Post Text */}
          <Text style={styles.postText}>{post.content || post.text || 'No content'}</Text>

          {/* Post Image */}
          {post.image && (
            <View style={styles.postImageContainer}>
              <Image 
                source={post.image}
                style={styles.postImage} 
                resizeMode="cover" 
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
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          {commentText.trim() && (
            <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {!commentText.trim() && (
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>COMMENTS ({comments.length})</Text>
            <Text style={styles.recentText}>Recent</Text>
          </View>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                {comment.userAvatar ? (
                  <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatarImage} />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarText}>
                      {comment.username?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
                <TouchableOpacity style={styles.replyButton}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.commentLikeButton}>
                <Ionicons name="thumbs-up-outline" size={16} color={colors.textMuted} />
                <Text style={styles.commentLikes}>{comment.likes}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postUserDetails: {
    flex: 1,
  },
  postUsername: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
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
    color: '#6B7280',
  },
  postText: {
    fontSize: fontSize.md,
    color: '#000000',
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
    height: 300,
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
    color: '#6B7280',
    fontWeight: '500',
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    color: '#000000',
    paddingVertical: spacing.xs,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.xs,
  },
  emojiButton: {
    padding: spacing.xs,
  },
  commentsSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  commentsTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  recentText: {
    fontSize: fontSize.sm,
    color: '#6B7280',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  commentUsername: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#000000',
  },
  commentTime: {
    fontSize: fontSize.xs,
    color: '#6B7280',
  },
  commentText: {
    fontSize: fontSize.sm,
    color: '#000000',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  replyText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
  },
  commentLikes: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default PostViewScreen;

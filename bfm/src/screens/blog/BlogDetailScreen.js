import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

// Image imports - using require for local assets
const image1b = require('../../../assets/1b.jpg');
const image1c = require('../../../assets/1c.jpg');

const BlogDetailScreen = ({ blogPost, onClose }) => {
  // Default blog post data matching Figma
  const defaultPost = {
    id: '1',
    title: 'New VR Headsets That Will Shape the Metaverse',
    author: 'Mason Eduard',
    date: 'updated on Jan 4, 2022',
    category: 'Technology',
    image: image1c,
    tags: ['social media', 'communication', 'empathy'],
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    authorBio: {
      name: 'Amin Toussaint',
      description: 'top-performing, detail-oriented, and profit-driven leader with a proven track record of success in driving business growth and operational excellence. With extensive experience in strategic planning, team leadership, and process optimization, I have consistently delivered exceptional results across diverse industries.',
      avatar: null,
    },
  };

  const post = blogPost || defaultPost;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <BuzzBreachLogo size={24} />
        <Text style={styles.logoText}>BUZZBREACH</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Blog Image */}
        <View style={styles.imageContainer}>
          {post.image ? (
            <Image source={post.image} style={styles.blogImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Category and Date */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryTag, post.category === 'Technology' && styles.technologyTag]}>
            <Text style={[styles.categoryTagText, post.category === 'Technology' && styles.technologyTagText]}>
              {post.category}
            </Text>
          </View>
          <Text style={styles.dateText}>{post.date}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Author */}
        <Text style={styles.author}>By: {post.author}</Text>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}{index < post.tags.length - 1 ? ', ' : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Content */}
        <Text style={styles.content}>{post.content}</Text>

        {/* About the Author */}
        {post.authorBio && (
          <View style={styles.authorSection}>
            <Text style={styles.authorSectionTitle}>About the Author</Text>
            <View style={styles.authorBio}>
              <View style={styles.authorAvatar}>
                {post.authorBio.avatar ? (
                  <Image source={{ uri: post.authorBio.avatar }} style={styles.authorAvatarImage} />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Text style={styles.authorAvatarText}>
                      {post.authorBio.name?.[0]?.toUpperCase() || 'A'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.authorBioContent}>
                <Text style={styles.authorBioName}>{post.authorBio.name}</Text>
                <Text style={styles.authorBioDescription}>{post.authorBio.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* More Content */}
        <Text style={styles.content}>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
        </Text>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
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
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: spacing.md,
  },
  blogImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  categoryTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  technologyTagText: {
    color: '#3B82F6',
  },
  dateText: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  author: {
    fontSize: fontSize.md,
    color: '#6B7280',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  tag: {
    fontSize: fontSize.sm,
    color: '#6B7280',
  },
  content: {
    fontSize: fontSize.md,
    color: '#000000',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  authorSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  authorSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.md,
  },
  authorBio: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  authorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  authorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  authorAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorBioContent: {
    flex: 1,
  },
  authorBioName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.xs,
  },
  authorBioDescription: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default BlogDetailScreen;

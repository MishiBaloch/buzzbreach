import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

const NotificationsScreen = ({ onBack }) => {
  const notifications = [
    // TODAY notifications
    {
      id: '1',
      type: 'like',
      message: 'Sofia, John and +19 others liked your post',
      timeAgo: '10m ago',
      icon: 'heart',
      iconColor: '#EF4444',
      date: 'today',
    },
    {
      id: '2',
      type: 'anniversary',
      message: "Celebrate David's 2-year anniversary at Techcompany",
      timeAgo: '30m ago',
      icon: 'cake',
      iconColor: '#F59E0B',
      date: 'today',
    },
    {
      id: '3',
      type: 'mention',
      message: 'Ralph Edwards mentioned you in a post.',
      timeAgo: '30m ago',
      icon: 'chatbubble',
      iconColor: colors.primary,
      date: 'today',
    },
    {
      id: '4',
      type: 'birthday',
      message: "Savannah Wilson is celebrating birthday today. Drop a wish!",
      timeAgo: '30m ago',
      icon: 'gift',
      iconColor: '#10B981',
      date: 'today',
    },
    {
      id: '5',
      type: 'like',
      message: 'Sofia, John and +19 others liked your post',
      timeAgo: '10m ago',
      icon: 'heart',
      iconColor: '#EF4444',
      date: 'today',
    },
    {
      id: '6',
      type: 'comment',
      message: 'Alex Hamilton commented on your post: "Great insights!"',
      timeAgo: '1h ago',
      icon: 'chatbubble-ellipses-outline',
      iconColor: colors.primary,
      date: 'today',
    },
    {
      id: '7',
      type: 'follow',
      message: 'Taylor Smith started following you',
      timeAgo: '2h ago',
      icon: 'person-add',
      iconColor: '#3B82F6',
      date: 'today',
    },
    {
      id: '8',
      type: 'share',
      message: 'Morgan Lee shared your post',
      timeAgo: '3h ago',
      icon: 'share-outline',
      iconColor: '#8B5CF6',
      date: 'today',
    },
    {
      id: '9',
      type: 'event',
      message: 'New event: Tech Conference 2024 is happening tomorrow',
      timeAgo: '4h ago',
      icon: 'calendar',
      iconColor: '#F59E0B',
      date: 'today',
    },
    {
      id: '10',
      type: 'job',
      message: 'New job posting: Senior Developer at Innovation Corp',
      timeAgo: '5h ago',
      icon: 'briefcase',
      iconColor: '#10B981',
      date: 'today',
    },
    {
      id: '11',
      type: 'like',
      message: 'Jordan Martinez and 5 others liked your comment',
      timeAgo: '6h ago',
      icon: 'heart',
      iconColor: '#EF4444',
      date: 'today',
    },
    {
      id: '12',
      type: 'anniversary',
      message: "Celebrate Sarah's 3-year anniversary at Design Studio",
      timeAgo: '7h ago',
      icon: 'cake',
      iconColor: '#F59E0B',
      date: 'today',
    },
    // YESTERDAY notifications
    {
      id: '13',
      type: 'anniversary',
      message: "Celebrate David's 2-year anniversary at Techcompany",
      timeAgo: 'Yesterday',
      icon: 'cake',
      iconColor: '#F59E0B',
      date: 'yesterday',
    },
    {
      id: '14',
      type: 'birthday',
      message: "Savannah Wilson is celebrating birthday today. Drop a wish!",
      timeAgo: 'Yesterday',
      icon: 'gift',
      iconColor: '#10B981',
      date: 'yesterday',
    },
    {
      id: '15',
      type: 'like',
      message: 'Casey Johnson and 12 others liked your post',
      timeAgo: 'Yesterday',
      icon: 'heart',
      iconColor: '#EF4444',
      date: 'yesterday',
    },
    {
      id: '16',
      type: 'mention',
      message: 'Riley Chen mentioned you in a comment',
      timeAgo: 'Yesterday',
      icon: 'chatbubble',
      iconColor: colors.primary,
      date: 'yesterday',
    },
    {
      id: '17',
      type: 'follow',
      message: 'Avery Williams and 3 others started following you',
      timeAgo: 'Yesterday',
      icon: 'person-add',
      iconColor: '#3B82F6',
      date: 'yesterday',
    },
    {
      id: '18',
      type: 'comment',
      message: 'Quinn Brown replied to your comment',
      timeAgo: 'Yesterday',
      icon: 'chatbubble-ellipses-outline',
      iconColor: colors.primary,
      date: 'yesterday',
    },
    {
      id: '19',
      type: 'event',
      message: 'Reminder: Networking Mixer starts in 2 days',
      timeAgo: 'Yesterday',
      icon: 'calendar',
      iconColor: '#F59E0B',
      date: 'yesterday',
    },
    {
      id: '20',
      type: 'job',
      message: 'You applied for: Frontend Developer at StartupXYZ',
      timeAgo: 'Yesterday',
      icon: 'briefcase',
      iconColor: '#10B981',
      date: 'yesterday',
    },
  ];

  const groupNotificationsByDate = () => {
    const today = [];
    const yesterday = [];
    
    notifications.forEach((notif) => {
      if (notif.date === 'today') {
        today.push(notif);
      } else if (notif.date === 'yesterday') {
        yesterday.push(notif);
      }
    });

    return { today, yesterday };
  };

  const { today, yesterday } = groupNotificationsByDate();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Today Section */}
        {today.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TODAY</Text>
            {today.map((notif) => (
              <TouchableOpacity key={notif.id} style={styles.notificationItem}>
                <View style={[styles.notificationIcon, { backgroundColor: `${notif.iconColor}20` }]}>
                  <Ionicons name={notif.icon} size={20} color={notif.iconColor} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>{notif.message}</Text>
                  <Text style={styles.notificationTime}>{notif.timeAgo}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Yesterday Section */}
        {yesterday.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YESTERDAY</Text>
            {yesterday.map((notif) => (
              <TouchableOpacity key={notif.id} style={styles.notificationItem}>
                <View style={[styles.notificationIcon, { backgroundColor: `${notif.iconColor}20` }]}>
                  <Ionicons name={notif.icon} size={20} color={notif.iconColor} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>{notif.message}</Text>
                  <Text style={styles.notificationTime}>{notif.timeAgo}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  section: {
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#6B7280',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: spacing.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: fontSize.md,
    color: '#000000',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: fontSize.sm,
    color: '#6B7280',
  },
});

export default NotificationsScreen;

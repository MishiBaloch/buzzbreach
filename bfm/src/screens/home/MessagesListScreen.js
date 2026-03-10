import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

const MessagesListScreen = ({ onBack, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const recentContacts = [
    { id: '1', name: 'Kim', avatar: null },
    { id: '2', name: 'Steve', avatar: null },
    { id: '3', name: 'Mia', avatar: null },
  ];

  const chats = [
    {
      id: '1',
      name: 'Jessica Thompson',
      lastMessage: 'Hey you! Are u there?',
      timeAgo: 'Today, 4h ago',
      unreadCount: 2,
      avatar: null,
    },
    {
      id: '2',
      name: 'Kat Williams',
      lastMessage: 'Sure. Sunday works for me!',
      timeAgo: '20/9/21',
      unreadCount: 1,
      avatar: null,
    },
    {
      id: '3',
      name: 'Jacob Washington',
      lastMessage: 'Sent you an invite for next monday.',
      timeAgo: '20/9/21',
      unreadCount: 0,
      avatar: null,
    },
    {
      id: '4',
      name: 'L',
      lastMessage: 'Sent you an invite for next monday.',
      timeAgo: '19/9/21',
      unreadCount: 0,
      avatar: null,
    },
    {
      id: '5',
      name: 'Jessica Thompson',
      lastMessage: 'Hey you! Are u there?',
      timeAgo: '4h ago',
      unreadCount: 0,
      avatar: null,
    },
    {
      id: '6',
      name: 'Kat Williams',
      lastMessage: 'Sure. Sunday me!',
      timeAgo: '20/9/21',
      unreadCount: 0,
      avatar: null,
    },
    {
      id: '7',
      name: 'David Wayne',
      lastMessage: 'Great! How does 1200 pm today sound?',
      timeAgo: 'Yesterday',
      unreadCount: 0,
      avatar: null,
    },
    {
      id: '8',
      name: 'Alex Hamilton',
      lastMessage: 'Thanks for the update!',
      timeAgo: '2 days ago',
      unreadCount: 0,
      avatar: null,
    },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchIconButton}>
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recent Contacts */}
        {searchQuery === '' && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>RECENTS</Text>
            <View style={styles.recentContacts}>
              {recentContacts.map((contact) => (
                <TouchableOpacity 
                  key={contact.id} 
                  style={styles.recentContactItem}
                  onPress={() => onChatSelect && onChatSelect({ name: contact.name, id: contact.id })}
                >
                  <View style={styles.recentAvatar}>
                    {contact.avatar ? (
                      <Image source={{ uri: contact.avatar }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {contact.name?.[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recentName}>{contact.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Chat List */}
        <View style={styles.chatsSection}>
          {filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => onChatSelect && onChatSelect(chat)}
            >
              <View style={styles.chatAvatar}>
                {chat.avatar ? (
                  <Image source={{ uri: chat.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {chat.name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.timeAgo}</Text>
                </View>
                <View style={styles.chatMessageRow}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
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
  searchIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 40,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  recentSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#6B7280',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    letterSpacing: 0.5,
  },
  recentContacts: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  recentContactItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  recentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  recentName: {
    fontSize: fontSize.xs,
    color: '#000000',
  },
  chatsSection: {
    paddingTop: spacing.sm,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: spacing.md,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
  chatTime: {
    fontSize: fontSize.xs,
    color: '#6B7280',
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MessagesListScreen;

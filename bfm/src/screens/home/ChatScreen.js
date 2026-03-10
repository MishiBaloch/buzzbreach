import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

const ChatScreen = ({ chat, onBack }) => {
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef(null);

  const defaultChat = {
    id: '1',
    name: 'David Wayne',
    phone: '(+44) 50 9285 3022',
    avatar: null,
  };

  const currentChat = chat || defaultChat;

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'David Wayne',
      text: 'Hello! I just wanted to ask if you are available for a meeting.',
      time: '10:10',
      isMe: false,
      read: false,
    },
    {
      id: '2',
      sender: 'Me',
      text: 'Hi!',
      time: '10:10',
      isMe: true,
      read: true,
    },
    {
      id: '3',
      sender: 'Me',
      text: 'Absolutely, I wanted to have a chat as well. When should we do this?',
      time: '10:11',
      isMe: true,
      read: true,
    },
    {
      id: '4',
      sender: 'David Wayne',
      text: 'Great! How does 1200 pm today sound?',
      time: '10:11',
      isMe: false,
      read: false,
    },
    {
      id: '5',
      sender: 'David Wayne',
      text: 'All upto you.',
      time: '10:11',
      isMe: false,
      read: false,
    },
    {
      id: '6',
      sender: 'Me',
      text: 'Perfect!',
      time: '10:12',
      isMe: true,
      read: true,
    },
  ]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'Me',
        text: messageText.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isMe: true,
        read: false,
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <View style={styles.contactAvatar}>
          {currentChat.avatar ? (
            <Image source={{ uri: currentChat.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {currentChat.name?.[0]?.toUpperCase() || 'D'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{currentChat.name}</Text>
          <Text style={styles.contactPhone}>{currentChat.phone}</Text>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isMe ? styles.messageWrapperMe : styles.messageWrapperOther,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isMe ? styles.messageTextMe : styles.messageTextOther,
                  ]}
                >
                  {message.text}
                </Text>
                <View style={styles.messageFooter}>
                  <Text
                    style={[
                      styles.messageTime,
                      message.isMe ? styles.messageTimeMe : styles.messageTimeOther,
                    ]}
                  >
                    {message.time}
                  </Text>
                  {message.isMe && (
                    <Ionicons
                      name={message.read ? "checkmark-done" : "checkmark"}
                      size={14}
                      color={message.read ? colors.primary : '#9CA3AF'}
                      style={styles.readIcon}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          {messageText.trim() ? (
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: spacing.md,
  },
  contactAvatar: {
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
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: fontSize.sm,
    color: '#6B7280',
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageWrapper: {
    marginBottom: spacing.sm,
  },
  messageWrapperMe: {
    alignItems: 'flex-end',
  },
  messageWrapperOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  messageBubbleOther: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  messageTime: {
    fontSize: fontSize.xs,
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: '#6B7280',
  },
  readIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;

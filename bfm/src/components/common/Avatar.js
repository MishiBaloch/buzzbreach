import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme/colors';

const Avatar = ({
  source,
  name,
  size = 'medium', // 'small', 'medium', 'large', 'xlarge'
  showOnlineStatus = false,
  isOnline = false,
  style,
}) => {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  };

  const avatarSize = sizes[size] || sizes.medium;

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderAvatar = () => {
    if (source) {
      return (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      );
    }

    if (name) {
      return (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: avatarSize * 0.4 },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        <Ionicons
          name="person"
          size={avatarSize * 0.5}
          color={colors.gray500}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderAvatar()}
      {showOnlineStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isOnline ? colors.online : colors.offline,
              width: avatarSize * 0.25,
              height: avatarSize * 0.25,
              borderRadius: avatarSize * 0.125,
              right: avatarSize * 0.02,
              bottom: avatarSize * 0.02,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.gray200,
  },
  placeholder: {
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
    color: colors.gray600,
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default Avatar;

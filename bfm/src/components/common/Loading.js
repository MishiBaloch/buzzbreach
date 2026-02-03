import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

// Full screen loading overlay
export const LoadingOverlay = ({ visible, message }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

// Inline loading spinner
export const LoadingSpinner = ({ size = 'large', color = colors.primary, style }) => {
  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// Full screen loading state
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.fullScreenMessage}>{message}</Text>
    </View>
  );
};

// Skeleton loading placeholder
export const Skeleton = ({ width, height, borderRadius: br = 8, style }) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: br,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  spinnerContainer: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenMessage: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  skeleton: {
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
});

export default {
  LoadingOverlay,
  LoadingSpinner,
  LoadingScreen,
  Skeleton,
};

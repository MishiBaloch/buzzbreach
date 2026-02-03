import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';

const Badge = ({
  label,
  variant = 'default', // 'default', 'success', 'warning', 'error', 'info', 'primary'
  size = 'medium', // 'small', 'medium', 'large'
  style,
  textStyle,
}) => {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  // Variants - Dark Theme
  default: {
    backgroundColor: colors.surfaceLight,
  },
  success: {
    backgroundColor: colors.successLight,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  info: {
    backgroundColor: colors.infoLight,
  },
  primary: {
    backgroundColor: colors.surfaceLight,
  },
  // Sizes
  small: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  large: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  // Text
  text: {
    fontWeight: '500',
  },
  defaultText: {
    color: colors.textSecondary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.info,
  },
  primaryText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: fontSize.xs,
  },
  mediumText: {
    fontSize: fontSize.sm,
  },
  largeText: {
    fontSize: fontSize.md,
  },
});

export default Badge;

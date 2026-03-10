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

const NotificationsScreen = ({ navigation }) => {
  const [showInfoBox, setShowInfoBox] = useState(true);

  const renderMenuItem = (label, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Information Box */}
        {showInfoBox && (
          <View style={styles.infoBox}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} style={styles.infoBoxIcon} />
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoBoxText}>
                Your notification settings are consolidated and streamlined
              </Text>
              <TouchableOpacity>
                <Text style={styles.infoBoxLink}>Learn more</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.infoBoxClose}
              onPress={() => setShowInfoBox(false)}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {renderMenuItem('Searching for a job', () => navigation.navigate('JobNotifications'))}
          {renderMenuItem('Hiring someone', () => {})}
          {renderMenuItem('Connecting with others', () => {})}
          {renderMenuItem('Messaging', () => {})}
          {renderMenuItem('Groups', () => {})}
        </View>

        {/* Advanced Settings Button */}
        <TouchableOpacity style={styles.advancedButton}>
          <Text style={styles.advancedButtonText}>Advanced settings</Text>
        </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  helpButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  infoBoxIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxText: {
    fontSize: fontSize.md,
    color: '#000000',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  infoBoxLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  infoBoxClose: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLabel: {
    fontSize: fontSize.md,
    color: '#000000',
    fontWeight: '400',
  },
  advancedButton: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  advancedButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NotificationsScreen;

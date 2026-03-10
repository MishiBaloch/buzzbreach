import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme/colors';

const AccountPreferencesScreen = ({ navigation }) => {
  const [soundEffects, setSoundEffects] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [syncContacts, setSyncContacts] = useState(false);

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderMenuItem = (label, value, onPress, showChevron = true) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.chevron} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderToggleItem = (label, value, onValueChange, showChevron = false) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <View style={styles.menuItemRight}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D5DB', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.chevron} />
        )}
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Account preferences</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile information */}
        {renderSection(
          'Profile information',
          <>
            {renderMenuItem(
              'Name, location, and industry',
              null,
              () => navigation.navigate('EditProfile')
            )}
            {renderMenuItem('Verifications', null, () => {})}
          </>
        )}

        {/* General */}
        {renderSection(
          'General',
          <>
            {renderMenuItem('Language', 'English', () => {})}
            {renderMenuItem('Autoplay videos', null, () => {})}
            {renderToggleItem('Sound effects', soundEffects, setSoundEffects)}
            {renderMenuItem('Showing profile photos', 'All members', () => {})}
          </>
        )}

        {/* Syncing options */}
        {renderSection(
          'Syncing options',
          <>
            {renderToggleItem('Sync calendar', syncCalendar, setSyncCalendar)}
            {renderToggleItem('Sync contacts', syncContacts, setSyncContacts)}
          </>
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
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemValue: {
    fontSize: fontSize.md,
    color: '#6B7280',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});

export default AccountPreferencesScreen;

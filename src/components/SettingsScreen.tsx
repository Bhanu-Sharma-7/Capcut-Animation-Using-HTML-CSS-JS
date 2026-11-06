import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface SettingsScreenProps {
  profile: UserProfile;
  theme: AppTheme;
  onUpdateSettings: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  theme,
  onUpdateSettings,
  onResetData,
}) => {
  const isDarkMode = profile.themeMode === 'dark';

  const handleToggleTheme = (val: boolean) => {
    haptic.selection();
    onUpdateSettings({ themeMode: val ? 'dark' : 'light' });
  };

  const handleToggleHaptics = (val: boolean) => {
    onUpdateSettings({ hapticsEnabled: val });
    if (val) haptic.medium(true);
  };

  const handleToggleSound = (val: boolean) => {
    haptic.selection();
    onUpdateSettings({ soundEnabled: val });
  };

  const confirmReset = () => {
    haptic.warning();
    Alert.alert(
      'Reset All Progress',
      'This will reset your statistics, personal best times, win streak, and ongoing game. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            onResetData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textMuted }]}>
            App preferences, appearance & controls
          </Text>
        </View>

        {/* Section 1: Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.primarySubtle },
                  ]}
                >
                  <Ionicons
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={20}
                    color={theme.colors.primaryLight}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.rowSubtitle,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {isDarkMode ? 'Slate / Midnight theme' : 'Crisp Light theme'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{
                  false: theme.colors.cardBorder,
                  true: theme.colors.primary,
                }}
                thumbColor={isDarkMode ? theme.colors.primaryLight : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Sensory & Audio */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            FEEDBACK & SENSORY
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.primarySubtle },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color={theme.colors.primaryLight}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                    Haptic Vibrations
                  </Text>
                  <Text
                    style={[
                      styles.rowSubtitle,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Tactile pulses on cell taps & errors
                  </Text>
                </View>
              </View>

              <Switch
                value={profile.hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{
                  false: theme.colors.cardBorder,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  profile.hapticsEnabled ? theme.colors.primaryLight : '#FFFFFF'
                }
              />
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.primarySubtle },
                  ]}
                >
                  <Ionicons
                    name={
                      profile.soundEnabled
                        ? 'volume-high-outline'
                        : 'volume-mute-outline'
                    }
                    size={20}
                    color={theme.colors.primaryLight}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                    Sound Effects
                  </Text>
                  <Text
                    style={[
                      styles.rowSubtitle,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Audio cues on placements & victory
                  </Text>
                </View>
              </View>

              <Switch
                value={profile.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{
                  false: theme.colors.cardBorder,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  profile.soundEnabled ? theme.colors.primaryLight : '#FFFFFF'
                }
              />
            </View>
          </View>
        </View>

        {/* Section 3: Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            DATA & STORAGE
          </Text>

          <TouchableOpacity
            style={[
              styles.dangerCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.errorSubtle,
              },
            ]}
            onPress={confirmReset}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.errorSubtle },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.error}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.dangerTitle, { color: theme.colors.error }]}>
                  Reset Progress & Statistics
                </Text>
                <Text
                  style={[
                    styles.rowSubtitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Clear all career wins, records, and save state
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>

        {/* Section 4: About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            ABOUT
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
                marginBottom: 24,
              },
            ]}
          >
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                Application
              </Text>
              <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                Sudoku Master Mind
              </Text>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                1.3.0 (Build 42)
              </Text>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                Algorithm
              </Text>
              <Text style={[styles.aboutValue, { color: theme.colors.text }]}>
                MRV Backtracking Engine
              </Text>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: theme.colors.textSecondary }]}>
                Status
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>100% Offline</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 18,
  },
  header: {
    gap: 2,
    paddingVertical: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    fontSize: 13,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    gap: 2,
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  dangerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  aboutValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
});


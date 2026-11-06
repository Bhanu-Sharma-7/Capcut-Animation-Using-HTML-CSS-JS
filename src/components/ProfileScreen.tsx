import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface ProfileScreenProps {
  profile: UserProfile;
  theme: AppTheme;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const AVAILABLE_AVATARS: (keyof typeof Ionicons.glyphMap)[] = [
  'trophy',
  'flash',
  'shield',
  'flame',
  'rocket',
  'star',
  'bulb',
  'compass',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  theme,
  onUpdateProfile,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>(profile.username);

  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRank = (gamesWon: number) => {
    if (gamesWon >= 25) return { title: 'Grandmaster', icon: 'ribbon' };
    if (gamesWon >= 10) return { title: 'Sudoku Master', icon: 'medal' };
    if (gamesWon >= 3) return { title: 'Adept Puzzler', icon: 'shield-checkmark' };
    return { title: 'Novice Solver', icon: 'sparkles' };
  };

  const handleSaveName = () => {
    const trimmed = usernameInput.trim();
    if (trimmed.length > 0) {
      haptic.medium();
      onUpdateProfile({ username: trimmed });
    } else {
      setUsernameInput(profile.username);
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (iconName: string) => {
    haptic.selection();
    onUpdateProfile({ avatarIcon: iconName });
  };

  const rank = getRank(profile.gamesWon);

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
        {/* Screen Title */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
            Player Profile
          </Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textMuted }]}>
            Your persona, badges & career statistics
          </Text>
        </View>

        {/* Profile Identity Card */}
        <View
          style={[
            styles.identityCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.colors.primarySubtle },
            ]}
          >
            <Ionicons
              name={profile.avatarIcon as keyof typeof Ionicons.glyphMap}
              size={42}
              color={theme.colors.primaryLight}
            />
          </View>

          {/* Editable Username */}
          <View style={styles.nameArea}>
            {isEditingName ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  value={usernameInput}
                  onChangeText={setUsernameInput}
                  maxLength={18}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity
                  style={[
                    styles.saveNameBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSaveName}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.displayNameRow}
                onPress={() => {
                  haptic.selection();
                  setIsEditingName(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.displayName, { color: theme.colors.text }]}>
                  {profile.username}
                </Text>
                <Ionicons
                  name="pencil"
                  size={15}
                  color={theme.colors.primaryLight}
                />
              </TouchableOpacity>
            )}

            <View
              style={[
                styles.rankBadge,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Ionicons
                name={rank.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={theme.colors.primaryLight}
              />
              <Text
                style={[
                  styles.rankBadgeText,
                  { color: theme.colors.primaryLight },
                ]}
              >
                {rank.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Avatar Selection Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Choose Player Badge
          </Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>
            Tap any icon below to update your in-game identity
          </Text>

          <View style={styles.avatarGrid}>
            {AVAILABLE_AVATARS.map((iconName) => {
              const isSelected = profile.avatarIcon === iconName;
              return (
                <TouchableOpacity
                  key={`avatar-opt-${iconName}`}
                  style={[
                    styles.avatarOption,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primarySubtle
                        : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primaryLight
                        : theme.colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleSelectAvatar(iconName)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={
                      isSelected
                        ? theme.colors.primaryLight
                        : theme.colors.textSecondary
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Career Stats Grid */}
        <View style={styles.statsHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Career Records
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Total Won */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: theme.colors.warningSubtle },
              ]}
            >
              <Ionicons
                name="trophy"
                size={20}
                color={theme.colors.warning}
              />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {profile.gamesWon}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Total Wins
            </Text>
          </View>

          {/* Win Streak */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Ionicons
                name="flash"
                size={20}
                color={theme.colors.primaryLight}
              />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {profile.winStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Win Streak
            </Text>
          </View>
        </View>

        {/* Best Times Breakdown */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
              marginBottom: 20,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Fastest Solves
          </Text>

          <View style={styles.timesList}>
            {/* Easy Record */}
            <View style={styles.timeRow}>
              <View style={styles.timeRowLeft}>
                <Ionicons
                  name="leaf"
                  size={16}
                  color={theme.colors.success}
                />
                <Text style={[styles.timeRowName, { color: theme.colors.text }]}>
                  Easy Mode
                </Text>
              </View>
              <Text style={[styles.timeRowValue, { color: theme.colors.text }]}>
                {formatTime(profile.bestTimeEasy)}
              </Text>
            </View>

            <View
              style={[
                styles.rowDivider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            {/* Medium Record */}
            <View style={styles.timeRow}>
              <View style={styles.timeRowLeft}>
                <Ionicons
                  name="flame"
                  size={16}
                  color={theme.colors.primaryLight}
                />
                <Text style={[styles.timeRowName, { color: theme.colors.text }]}>
                  Medium Mode
                </Text>
              </View>
              <Text style={[styles.timeRowValue, { color: theme.colors.text }]}>
                {formatTime(profile.bestTimeMedium)}
              </Text>
            </View>

            <View
              style={[
                styles.rowDivider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            {/* Hard Record */}
            <View style={styles.timeRow}>
              <View style={styles.timeRowLeft}>
                <Ionicons
                  name="skull"
                  size={16}
                  color={theme.colors.warning}
                />
                <Text style={[styles.timeRowName, { color: theme.colors.text }]}>
                  Hard Mode
                </Text>
              </View>
              <Text style={[styles.timeRowValue, { color: theme.colors.text }]}>
                {formatTime(profile.bestTimeHard)}
              </Text>
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
    gap: 16,
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
  identityCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameArea: {
    alignItems: 'center',
    gap: 8,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 160,
    textAlign: 'center',
  },
  saveNameBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsHeaderRow: {
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timesList: {
    marginTop: 6,
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeRowName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeRowValue: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  rowDivider: {
    height: 1,
    width: '100%',
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, StoredGameState, Difficulty } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface HomeScreenProps {
  profile: UserProfile;
  ongoingGame: StoredGameState | null;
  theme: AppTheme;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onResumeGame: () => void;
  onNavigateTab: (tab: 'HOME' | 'PROFILE' | 'SETTINGS') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  ongoingGame,
  theme,
  onSelectDifficulty,
  onResumeGame,
  onNavigateTab,
}) => {
  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hasOngoing =
    ongoingGame &&
    !ongoingGame.isVictory &&
    !ongoingGame.isGameOver &&
    ongoingGame.board.length === 9;

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.brandIconBox,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Ionicons
                name="grid"
                size={20}
                color={theme.colors.primaryLight}
              />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
                SUDOKU
              </Text>
              <Text
                style={[styles.brandSubtitle, { color: theme.colors.textMuted }]}
              >
                CLASSIC PUZZLE
              </Text>
            </View>
          </View>

          {/* Quick Profile Pill */}
          <TouchableOpacity
            style={[
              styles.profilePill,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => onNavigateTab('PROFILE')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Ionicons
                name={profile.avatarIcon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={theme.colors.primaryLight}
              />
            </View>
            <Text
              style={[styles.profilePillName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {profile.username}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTagRow}>
              <View
                style={[
                  styles.heroBadge,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Text
                  style={[
                    styles.heroBadgeText,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  OFFLINE MIND CHALLENGE
                </Text>
              </View>
            </View>

            <Text style={[styles.heroHeading, { color: theme.colors.text }]}>
              Master Every Grid
            </Text>
            <Text
              style={[styles.heroDescription, { color: theme.colors.textSecondary }]}
            >
              Sharpen your deductive logic with pure unique backtracking puzzles.
            </Text>

            <TouchableOpacity
              style={[
                styles.heroPlayButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => onSelectDifficulty('Medium')}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={styles.heroPlayText}>QUICK PLAY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resume Ongoing Game Banner */}
        {hasOngoing && (
          <TouchableOpacity
            style={[
              styles.resumeCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.primaryLight,
              },
            ]}
            onPress={() => {
              haptic.medium();
              onResumeGame();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.resumeInfo}>
              <View style={styles.resumeStatusRow}>
                <View
                  style={[
                    styles.pulseLiveDot,
                    { backgroundColor: theme.colors.success },
                  ]}
                />
                <Text
                  style={[
                    styles.resumeStatusText,
                    { color: theme.colors.success },
                  ]}
                >
                  MATCH IN PROGRESS
                </Text>
              </View>

              <Text
                style={[styles.resumeDifficulty, { color: theme.colors.text }]}
              >
                {ongoingGame.difficulty} Match
              </Text>
              <Text
                style={[styles.resumeMeta, { color: theme.colors.textSecondary }]}
              >
                Time: {formatTime(ongoingGame.timerSeconds)} • Mistakes:{' '}
                {ongoingGame.mistakes}/3
              </Text>
            </View>

            <View
              style={[
                styles.resumeArrowBox,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Difficulty Selection Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Challenge
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
            Pick a tier to generate a uniquely solvable board
          </Text>
        </View>

        <View style={styles.difficultyGrid}>
          {/* Easy */}
          <TouchableOpacity
            style={[
              styles.diffCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => onSelectDifficulty('Easy')}
            activeOpacity={0.8}
          >
            <View style={styles.diffCardTop}>
              <View
                style={[
                  styles.diffIconWrapper,
                  { backgroundColor: theme.colors.successSubtle },
                ]}
              >
                <Ionicons
                  name="leaf"
                  size={20}
                  color={theme.colors.success}
                />
              </View>
              <View
                style={[
                  styles.tagPill,
                  { backgroundColor: theme.colors.successSubtle },
                ]}
              >
                <Text
                  style={[styles.tagPillText, { color: theme.colors.success }]}
                >
                  FREE
                </Text>
              </View>
            </View>

            <Text style={[styles.diffCardName, { color: theme.colors.text }]}>
              Easy
            </Text>
            <Text
              style={[styles.diffCardClues, { color: theme.colors.textSecondary }]}
            >
              ~38 Clues • Gentle logic
            </Text>

            <View style={styles.diffCardFooter}>
              <Text
                style={[styles.bestLabel, { color: theme.colors.textMuted }]}
              >
                Best: {formatTime(profile.bestTimeEasy)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          {/* Medium */}
          <TouchableOpacity
            style={[
              styles.diffCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => onSelectDifficulty('Medium')}
            activeOpacity={0.8}
          >
            <View style={styles.diffCardTop}>
              <View
                style={[
                  styles.diffIconWrapper,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Ionicons
                  name="flame"
                  size={20}
                  color={theme.colors.primaryLight}
                />
              </View>
              <View
                style={[
                  styles.tagPill,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Text
                  style={[
                    styles.tagPillText,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  POPULAR
                </Text>
              </View>
            </View>

            <Text style={[styles.diffCardName, { color: theme.colors.text }]}>
              Medium
            </Text>
            <Text
              style={[styles.diffCardClues, { color: theme.colors.textSecondary }]}
            >
              ~30 Clues • Balanced
            </Text>

            <View style={styles.diffCardFooter}>
              <Text
                style={[styles.bestLabel, { color: theme.colors.textMuted }]}
              >
                Best: {formatTime(profile.bestTimeMedium)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          {/* Hard */}
          <TouchableOpacity
            style={[
              styles.diffCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => onSelectDifficulty('Hard')}
            activeOpacity={0.8}
          >
            <View style={styles.diffCardTop}>
              <View
                style={[
                  styles.diffIconWrapper,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="skull"
                  size={20}
                  color={theme.colors.warning}
                />
              </View>
              <View
                style={[
                  styles.tagPill,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Text
                  style={[styles.tagPillText, { color: theme.colors.warning }]}
                >
                  EXPERT
                </Text>
              </View>
            </View>

            <Text style={[styles.diffCardName, { color: theme.colors.text }]}>
              Hard
            </Text>
            <Text
              style={[styles.diffCardClues, { color: theme.colors.textSecondary }]}
            >
              ~24 Clues • Advanced
            </Text>

            <View style={styles.diffCardFooter}>
              <Text
                style={[styles.bestLabel, { color: theme.colors.textMuted }]}
              >
                Best: {formatTime(profile.bestTimeHard)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Summary */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.statCol}>
            <View style={styles.statIconRow}>
              <Ionicons
                name="trophy-outline"
                size={16}
                color={theme.colors.warning}
              />
              <Text
                style={[styles.statLabelText, { color: theme.colors.textMuted }]}
              >
                Games Won
              </Text>
            </View>
            <Text style={[styles.statValueText, { color: theme.colors.text }]}>
              {profile.gamesWon}
            </Text>
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.divider }]}
          />

          <View style={styles.statCol}>
            <View style={styles.statIconRow}>
              <Ionicons
                name="flash-outline"
                size={16}
                color={theme.colors.primaryLight}
              />
              <Text
                style={[styles.statLabelText, { color: theme.colors.textMuted }]}
              >
                Win Streak
              </Text>
            </View>
            <Text style={[styles.statValueText, { color: theme.colors.text }]}>
              {profile.winStreak}
            </Text>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    maxWidth: 140,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePillName: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroContent: {
    gap: 8,
  },
  heroTagRow: {
    flexDirection: 'row',
  },
  heroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  heroPlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  // Resume Card
  resumeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  resumeInfo: {
    gap: 4,
  },
  resumeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resumeStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resumeDifficulty: {
    fontSize: 16,
    fontWeight: '800',
  },
  resumeMeta: {
    fontSize: 12,
  },
  resumeArrowBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Headers
  sectionHeader: {
    marginTop: 4,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
  },

  // Difficulty Cards
  difficultyGrid: {
    gap: 10,
  },
  diffCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  diffCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  diffCardName: {
    fontSize: 17,
    fontWeight: '800',
  },
  diffCardClues: {
    fontSize: 12,
  },
  diffCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  bestLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Stats Card
  statsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
});

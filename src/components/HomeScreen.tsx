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
import { UserProfile, StoredGameState } from '../types/game';
import { haptic } from '../utils/haptics';

interface HomeScreenProps {
  profile: UserProfile;
  ongoingGame: StoredGameState | null;
  onPlayGame: () => void;
  onResumeGame: () => void;
  onOpenProfileEdit: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  ongoingGame,
  onPlayGame,
  onResumeGame,
  onOpenProfileEdit,
  onOpenSettings,
}) => {
  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRank = (gamesWon: number) => {
    if (gamesWon >= 25) return '👑 Grandmaster';
    if (gamesWon >= 10) return '⚡ Sudoku Master';
    if (gamesWon >= 3) return '🎯 Adept Puzzler';
    return '🌱 Novice Solver';
  };

  const hasOngoing =
    ongoingGame &&
    !ongoingGame.isVictory &&
    !ongoingGame.isGameOver &&
    ongoingGame.board.length === 9;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileUserArea}
            onPress={() => {
              haptic.selection();
              onOpenProfileEdit();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
            </View>
            <View style={styles.userTextInfo}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.editPencil}>✎</Text>
              </View>
              <Text style={styles.userRank}>{getRank(profile.gamesWon)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => {
              haptic.selection();
              onOpenSettings();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Branding Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroBadge}>ORIGINAL LOGIC</Text>
            <Text style={styles.heroTitle}>SUDOKU MASTER</Text>
            <Text style={styles.heroSubtitle}>
              Clean, offline & responsive brain puzzles
            </Text>
          </View>
          <View style={styles.heroGridDecoration}>
            <Text style={styles.heroDecoText}>9 4 1</Text>
            <Text style={styles.heroDecoText}>2 8 7</Text>
            <Text style={styles.heroDecoText}>6 3 5</Text>
          </View>
        </View>

        {/* Ongoing Game Resume Card */}
        {hasOngoing && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => {
              haptic.medium();
              onResumeGame();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.resumeLeft}>
              <View style={styles.resumeTag}>
                <Text style={styles.resumeTagText}>MATCH IN PROGRESS</Text>
              </View>
              <Text style={styles.resumeTitle}>
                Continue {ongoingGame.difficulty} Puzzle
              </Text>
              <Text style={styles.resumeMeta}>
                Time: {formatTime(ongoingGame.timerSeconds)} • Mistakes:{' '}
                {ongoingGame.mistakes}/3
              </Text>
            </View>
            <View style={styles.resumeArrowBtn}>
              <Text style={styles.resumeArrowText}>▶</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.playGameBtn}
          onPress={() => {
            haptic.medium();
            onPlayGame();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.playGameIcon}>▶</Text>
          <Text style={styles.playGameText}>PLAY NEW GAME</Text>
        </TouchableOpacity>

        {/* Player Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionHeader}>Career Statistics</Text>

          {/* Games Won Card */}
          <View style={styles.mainStatCard}>
            <View style={styles.mainStatLeft}>
              <Text style={styles.statIcon}>🏆</Text>
              <View>
                <Text style={styles.mainStatLabel}>Total Games Won</Text>
                <Text style={styles.mainStatValue}>{profile.gamesWon}</Text>
              </View>
            </View>
            <View style={styles.winBadge}>
              <Text style={styles.winBadgeText}>100% Verified</Text>
            </View>
          </View>

          {/* Best Times Grid */}
          <View style={styles.bestTimesRow}>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardDifficulty}>Easy</Text>
              <Text style={styles.timeCardValue}>
                {formatTime(profile.bestTimeEasy)}
              </Text>
              <Text style={styles.timeCardLabel}>Best Record</Text>
            </View>

            <View style={styles.timeCard}>
              <Text style={styles.timeCardDifficulty}>Medium</Text>
              <Text style={styles.timeCardValue}>
                {formatTime(profile.bestTimeMedium)}
              </Text>
              <Text style={styles.timeCardLabel}>Best Record</Text>
            </View>

            <View style={styles.timeCard}>
              <Text style={styles.timeCardDifficulty}>Hard</Text>
              <Text style={styles.timeCardValue}>
                {formatTime(profile.bestTimeHard)}
              </Text>
              <Text style={styles.timeCardLabel}>Best Record</Text>
            </View>
          </View>
        </View>

        {/* How to Play / Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Quick Pro Tip</Text>
          </View>
          <Text style={styles.tipBody}>
            Use the <Text style={styles.tipHighlight}>Notes (✎)</Text> mode to
            jot down candidate digits in empty cells before making firm
            placements!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 18,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  profileUserArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userTextInfo: {
    gap: 2,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  editPencil: {
    fontSize: 12,
    color: '#38BDF8',
  },
  userRank: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsEmoji: {
    fontSize: 18,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1F2937',
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
    gap: 4,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#38BDF8',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#F8FAFC',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  heroGridDecoration: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 2,
  },
  heroDecoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#38BDF8',
    textAlign: 'center',
  },

  // Resume Card
  resumeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#38BDF8',
    elevation: 3,
  },
  resumeLeft: {
    flex: 1,
    gap: 4,
  },
  resumeTag: {
    backgroundColor: '#0F172A',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resumeTagText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  resumeMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resumeArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  resumeArrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },

  // Play Game Button
  playGameBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  playGameIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  playGameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // Stats
  statsSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mainStatCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  mainStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statIcon: {
    fontSize: 32,
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mainStatValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  winBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  winBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  bestTimesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 2,
  },
  timeCardDifficulty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  timeCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  timeCardLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 6,
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
  },
  tipBody: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  tipHighlight: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});

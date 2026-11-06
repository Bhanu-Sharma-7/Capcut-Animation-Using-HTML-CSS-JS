import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Difficulty, UserProfile } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface DifficultyModalProps {
  visible: boolean;
  profile: UserProfile;
  theme: AppTheme;
  currentDifficulty?: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onClose: () => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  visible,
  profile,
  theme,
  currentDifficulty,
  onSelectDifficulty,
  onClose,
}) => {
  const nextMediumMatch = profile.mediumMatchesCount + 1;
  const isMediumAdNext = nextMediumMatch % 5 === 0;
  const remainingMediumFree = 5 - (nextMediumMatch % 5);

  const formatBestTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Select Difficulty
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Choose a challenge level to generate a fresh Sudoku puzzle
          </Text>

          <View style={styles.optionsList}>
            {/* EASY */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    currentDifficulty === 'Easy'
                      ? theme.colors.primarySubtle
                      : theme.colors.surface,
                  borderColor:
                    currentDifficulty === 'Easy'
                      ? theme.colors.primaryLight
                      : theme.colors.cardBorder,
                },
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Easy');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionName, { color: theme.colors.text }]}>
                    Easy
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: theme.colors.successSubtle,
                        borderColor: theme.colors.success,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: theme.colors.success },
                      ]}
                    >
                      100% Free
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.optionDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ~38 Clues • Relaxed logic for beginners
                </Text>
                <Text
                  style={[styles.optionBest, { color: theme.colors.textMuted }]}
                >
                  Best Time: {formatBestTime(profile.bestTimeEasy)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>

            {/* MEDIUM */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    currentDifficulty === 'Medium'
                      ? theme.colors.primarySubtle
                      : theme.colors.surface,
                  borderColor:
                    currentDifficulty === 'Medium'
                      ? theme.colors.primaryLight
                      : theme.colors.cardBorder,
                },
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Medium');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionName, { color: theme.colors.text }]}>
                    Medium
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isMediumAdNext
                          ? theme.colors.warningSubtle
                          : theme.colors.primarySubtle,
                        borderColor: isMediumAdNext
                          ? theme.colors.warning
                          : theme.colors.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: isMediumAdNext
                            ? theme.colors.warning
                            : theme.colors.primaryLight,
                        },
                      ]}
                    >
                      {isMediumAdNext
                        ? 'Ad on Match #5'
                        : `${remainingMediumFree} Free Remaining`}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.optionDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ~30 Clues • Standard deductive solving
                </Text>
                <Text
                  style={[styles.optionBest, { color: theme.colors.textMuted }]}
                >
                  Best Time: {formatBestTime(profile.bestTimeMedium)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>

            {/* HARD */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    currentDifficulty === 'Hard'
                      ? theme.colors.primarySubtle
                      : theme.colors.surface,
                  borderColor:
                    currentDifficulty === 'Hard'
                      ? theme.colors.primaryLight
                      : theme.colors.cardBorder,
                },
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Hard');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionName, { color: theme.colors.text }]}>
                    Hard
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: theme.colors.warningSubtle,
                        borderColor: theme.colors.warning,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: theme.colors.warning },
                      ]}
                    >
                      Ad Required
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.optionDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ~24 Clues • Pure advanced reasoning
                </Text>
                <Text
                  style={[styles.optionBest, { color: theme.colors.textMuted }]}
                >
                  Best Time: {formatBestTime(profile.bestTimeHard)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            style={[
              styles.cancelBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => {
              haptic.selection();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  optionLeft: {
    flex: 1,
    gap: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionName: {
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
  },
  optionBest: {
    fontSize: 11,
    fontWeight: '600',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

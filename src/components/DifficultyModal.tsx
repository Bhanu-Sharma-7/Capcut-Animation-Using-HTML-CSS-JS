import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Difficulty, UserProfile } from '../types/game';
import { haptic } from '../utils/haptics';

interface DifficultyModalProps {
  visible: boolean;
  profile: UserProfile;
  currentDifficulty?: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onClose: () => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  visible,
  profile,
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
        <View style={styles.card}>
          <Text style={styles.title}>Select Difficulty</Text>
          <Text style={styles.subtitle}>
            Choose a challenge level to generate a fresh Sudoku puzzle
          </Text>

          <View style={styles.optionsList}>
            {/* EASY */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                currentDifficulty === 'Easy' && styles.optionCurrent,
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Easy');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>Easy</Text>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>100% Free</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  ~38 Clues • Relaxed logic for beginners
                </Text>
                <Text style={styles.optionBest}>
                  Best Time: {formatBestTime(profile.bestTimeEasy)}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>

            {/* MEDIUM */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                currentDifficulty === 'Medium' && styles.optionCurrent,
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Medium');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>Medium</Text>
                  <View
                    style={[
                      styles.adBadge,
                      isMediumAdNext ? styles.adBadgeAlert : styles.adBadgeNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.adBadgeText,
                        isMediumAdNext && styles.adBadgeAlertText,
                      ]}
                    >
                      {isMediumAdNext
                        ? 'Ad on Match #5'
                        : `${remainingMediumFree} Free Remaining`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  ~30 Clues • Standard deductive solving
                </Text>
                <Text style={styles.optionBest}>
                  Best Time: {formatBestTime(profile.bestTimeMedium)}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>

            {/* HARD */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                currentDifficulty === 'Hard' && styles.optionCurrent,
              ]}
              onPress={() => {
                haptic.selection();
                onSelectDifficulty('Hard');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionName}>Hard</Text>
                  <View style={styles.goldBadge}>
                    <Text style={styles.goldBadgeText}>Ad Required</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  ~24 Clues • Pure advanced reasoning
                </Text>
                <Text style={styles.optionBest}>
                  Best Time: {formatBestTime(profile.bestTimeHard)}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              haptic.selection();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 22,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionCurrent: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E3A5F',
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
    color: '#F8FAFC',
  },
  freeBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  freeBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  adBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  adBadgeNormal: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  adBadgeAlert: {
    backgroundColor: '#451A03',
    borderColor: '#F59E0B',
  },
  adBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  adBadgeAlertText: {
    color: '#FBBF24',
  },
  goldBadge: {
    backgroundColor: '#451A03',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  goldBadgeText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    color: '#94A3B8',
  },
  optionBest: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#38BDF8',
    marginLeft: 8,
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});

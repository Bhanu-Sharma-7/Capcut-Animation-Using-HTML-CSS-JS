import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdType } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface SimulatedAdModalProps {
  visible: boolean;
  type: AdType;
  theme: AppTheme;
  title?: string;
  durationSeconds?: number;
  onComplete: () => void;
  onCancel?: () => void;
}

export const SimulatedAdModal: React.FC<SimulatedAdModalProps> = ({
  visible,
  type,
  theme,
  title = 'Sponsor Ad',
  durationSeconds = 4,
  onComplete,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setSecondsRemaining(durationSeconds);
      setIsCompleted(false);
      progressAnim.setValue(0);
      return;
    }

    setSecondsRemaining(durationSeconds);
    setIsCompleted(false);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationSeconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          haptic.light();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      progressAnim.stopAnimation();
    };
  }, [visible, durationSeconds, progressAnim]);

  if (!visible) return null;

  const handleFinish = () => {
    haptic.medium();
    onComplete();
  };

  const isRewarded = type === 'REWARDED';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (isCompleted) {
          handleFinish();
        } else if (onCancel) {
          onCancel();
        }
      }}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.adContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.adBadge,
                {
                  backgroundColor: theme.colors.warningSubtle,
                  borderColor: theme.colors.warning,
                },
              ]}
            >
              <Text
                style={[styles.adBadgeText, { color: theme.colors.warning }]}
              >
                AD • SIMULATED
              </Text>
            </View>

            <View style={styles.counterContainer}>
              {!isCompleted ? (
                <Text
                  style={[styles.counterText, { color: theme.colors.textMuted }]}
                >
                  {isRewarded ? 'Reward in ' : 'Skip in '}
                  <Text
                    style={[
                      styles.counterHighlight,
                      { color: theme.colors.primaryLight },
                    ]}
                  >
                    {secondsRemaining}s
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeBtnText}>
                    {isRewarded ? 'Claim Reward' : 'Continue'}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Creative Card */}
          <View
            style={[
              styles.creativeCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.appIconContainer,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Ionicons
                name="extension-puzzle"
                size={34}
                color={theme.colors.primaryLight}
              />
            </View>

            <Text style={[styles.adAppTitle, { color: theme.colors.text }]}>
              Logic Mind Puzzles 3D
            </Text>
            <Text
              style={[styles.adAppCategory, { color: theme.colors.textMuted }]}
            >
              Brain Training & Offline Logic
            </Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={`star-${i}`} name="star" size={14} color="#FBBF24" />
              ))}
              <Text
                style={[styles.ratingScore, { color: theme.colors.textSecondary }]}
              >
                4.9 (1.4M Reviews)
              </Text>
            </View>

            <View
              style={[
                styles.mockBannerGraphic,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.mockBannerTitle,
                  { color: theme.colors.primaryLight },
                ]}
              >
                10,000+ Unique Challenges
              </Text>
              <Text
                style={[
                  styles.mockBannerSubtitle,
                  { color: theme.colors.textMuted },
                ]}
              >
                Play without internet anytime, anywhere.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.installBtn,
                { backgroundColor: theme.colors.success },
              ]}
              activeOpacity={0.8}
              onPress={() => haptic.selection()}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.installBtnText}>INSTALL FREE</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.divider },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: theme.colors.primaryLight,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Bottom notices */}
          <View style={styles.footerRow}>
            <Text
              style={[styles.footerNotice, { color: theme.colors.textMuted }]}
            >
              {isCompleted
                ? isRewarded
                  ? 'Reward ready! Tap button above to continue.'
                  : 'Sponsor completed. Ready to play!'
                : `${title} (${secondsRemaining}s remaining)`}
            </Text>

            {onCancel && !isCompleted && isRewarded && (
              <TouchableOpacity
                onPress={onCancel}
                style={styles.cancelLink}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.cancelLinkText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Cancel Ad
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  adContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  adBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  counterContainer: {
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  counterHighlight: {
    fontWeight: '800',
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  creativeCard: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  adAppTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  adAppCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  mockBannerGraphic: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
    gap: 4,
  },
  mockBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  mockBannerSubtitle: {
    fontSize: 11,
    textAlign: 'center',
  },
  installBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  installBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
  },
  footerRow: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  footerNotice: {
    fontSize: 11,
    textAlign: 'center',
  },
  cancelLink: {
    padding: 4,
  },
  cancelLinkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { AdType } from '../types/game';
import { haptic } from '../utils/haptics';

interface SimulatedAdModalProps {
  visible: boolean;
  type: AdType;
  title?: string;
  durationSeconds?: number;
  onComplete: () => void;
  onCancel?: () => void;
}

export const SimulatedAdModal: React.FC<SimulatedAdModalProps> = ({
  visible,
  type,
  title = 'Sponsor Ad',
  durationSeconds = 4,
  onComplete,
  onCancel,
}) => {
  const { width } = useWindowDimensions();
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

    // Animate progress bar across duration
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
        <View style={styles.adContainer}>
          {/* Ad Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Ad • Simulated</Text>
            </View>

            <View style={styles.counterContainer}>
              {!isCompleted ? (
                <Text style={styles.counterText}>
                  {isRewarded ? 'Reward in ' : 'Skip in '}
                  <Text style={styles.counterHighlight}>{secondsRemaining}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeBtnText}>
                    {isRewarded ? 'Claim Reward ✓' : 'Continue ➔'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Ad Creative Card */}
          <View style={styles.creativeCard}>
            <View style={styles.appIconContainer}>
              <Text style={styles.appIconEmoji}>🧠</Text>
            </View>

            <Text style={styles.adAppTitle}>Brain Boost Puzzles 3D</Text>
            <Text style={styles.adAppCategory}>Puzzle • Mind Training</Text>

            <View style={styles.ratingRow}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.ratingScore}>4.9 (1.4M)</Text>
            </View>

            <View style={styles.mockBannerGraphic}>
              <Text style={styles.mockBannerTitle}>Challenge Your Logic</Text>
              <Text style={styles.mockBannerSubtitle}>
                Unlock 5,000+ levels of offline mind games!
              </Text>
              <View style={styles.demoPillsRow}>
                <View style={styles.demoPill}>
                  <Text style={styles.demoPillText}>Brain IQ +24%</Text>
                </View>
                <View style={styles.demoPill}>
                  <Text style={styles.demoPillText}>No WiFi Needed</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.installBtn}
              activeOpacity={0.8}
              onPress={() => haptic.selection()}
            >
              <Text style={styles.installBtnText}>INSTALL FREE</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Bottom message */}
          <View style={styles.footerRow}>
            <Text style={styles.footerNotice}>
              {isCompleted
                ? isRewarded
                  ? '🎉 Reward earned! Tap button above to continue.'
                  : 'Sponsor completed. Ready to play!'
                : `${title} (${secondsRemaining}s remaining)`}
            </Text>

            {onCancel && !isCompleted && isRewarded && (
              <TouchableOpacity
                onPress={onCancel}
                style={styles.cancelLink}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLinkText}>Cancel Ad</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  adContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
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
    backgroundColor: '#F59E0B22',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  counterContainer: {
    alignItems: 'flex-end',
  },
  counterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  counterHighlight: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  closeBtn: {
    backgroundColor: '#2563EB',
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
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginBottom: 10,
    elevation: 4,
  },
  appIconEmoji: {
    fontSize: 32,
  },
  adAppTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  adAppCategory: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  stars: {
    color: '#FBBF24',
    fontSize: 13,
    letterSpacing: 1,
  },
  ratingScore: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  mockBannerGraphic: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  mockBannerTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  mockBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoPillText: {
    color: '#A5F3FC',
    fontSize: 10,
    fontWeight: '600',
  },
  installBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  footerRow: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  footerNotice: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
  cancelLink: {
    padding: 4,
  },
  cancelLinkText: {
    color: '#94A3B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});


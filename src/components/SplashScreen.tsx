import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  useWindowDimensions,
} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { width } = useWindowDimensions();

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in and scale up logo
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulsing animation for loading indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Transition to Home after 2.4 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2200);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [onFinish, opacityAnim, pulseAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 3x3 Grid Logo Badge */}
        <View style={styles.logoGrid}>
          <View style={styles.logoRow}>
            <View style={[styles.logoCell, styles.cellAccent]}>
              <Text style={styles.cellDigit}>9</Text>
            </View>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>2</Text>
            </View>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>5</Text>
            </View>
          </View>
          <View style={styles.logoRow}>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>7</Text>
            </View>
            <View style={[styles.logoCell, styles.cellCenter]}>
              <Text style={[styles.cellDigit, styles.centerDigit]}>S</Text>
            </View>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>1</Text>
            </View>
          </View>
          <View style={styles.logoRow}>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>4</Text>
            </View>
            <View style={styles.logoCell}>
              <Text style={styles.cellDigit}>8</Text>
            </View>
            <View style={[styles.logoCell, styles.cellAccent]}>
              <Text style={styles.cellDigit}>3</Text>
            </View>
          </View>
        </View>

        <Text style={styles.appTitle}>SUDOKU</Text>
        <Text style={styles.appSubtitle}>MASTER MIND PUZZLE</Text>

        {/* Pulsing loading ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.pulseDot} />
        </Animated.View>

        <Text style={styles.loadingText}>Loading puzzle universe...</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.2.0 • Offline Ready</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGrid: {
    width: 108,
    height: 108,
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#38BDF8',
    padding: 6,
    justifyContent: 'space-between',
    elevation: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoCell: {
    width: 28,
    height: 28,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellAccent: {
    backgroundColor: '#1E3A8A',
  },
  cellCenter: {
    backgroundColor: '#2563EB',
  },
  cellDigit: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  centerDigit: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#38BDF8',
    marginBottom: 40,
  },
  pulseRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#38BDF855',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: 0.5,
  },
});

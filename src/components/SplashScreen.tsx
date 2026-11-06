import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { Logo } from '../../assets/Logo';
import { AppTheme } from '../theme/theme';

interface SplashScreenProps {
  onFinish: () => void;
  theme: AppTheme;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, theme }) => {
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

    // Transition to Main after ~2.2 seconds
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
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* SVG Logo Component */}
        <View style={styles.logoWrapper}>
          <Logo size={110} primaryColor={theme.colors.primary} />
        </View>

        <Text style={[styles.appTitle, { color: theme.colors.text }]}>
          SUDOKU
        </Text>
        <Text style={[styles.appSubtitle, { color: theme.colors.primaryLight }]}>
          MASTER MIND PUZZLE
        </Text>

        {/* Pulsing loading ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: `${theme.colors.primaryLight}55`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          />
        </Animated.View>

        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
          Loading puzzle universe...
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
          v1.3.0 • Offline Ready
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 40,
  },
  pulseRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

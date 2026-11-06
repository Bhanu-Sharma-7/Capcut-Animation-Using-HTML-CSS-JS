import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptic = {
  selection: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    } catch {
      // Ignore if device lacks haptic motor
    }
  },

  light: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignore
    }
  },

  medium: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Ignore
    }
  },

  warning: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      // Ignore
    }
  },

  error: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      // Ignore
    }
  },

  success: () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Ignore
    }
  },
};

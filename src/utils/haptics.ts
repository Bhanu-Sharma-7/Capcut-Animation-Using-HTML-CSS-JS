import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let isHapticsGlobalEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  isHapticsGlobalEnabled = enabled;
}

export const haptic = {
  selection: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  },

  light: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
  },

  medium: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  },

  warning: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  },

  error: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  },

  success: (enabled = isHapticsGlobalEnabled) => {
    if (!enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  },
};

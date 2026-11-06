import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { UserProfile } from '../types/game';
import { haptic } from '../utils/haptics';

interface SettingsModalProps {
  visible: boolean;
  profile: UserProfile;
  onUpdateSettings: (settings: Partial<UserProfile>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  profile,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  const handleToggleHaptics = (val: boolean) => {
    onUpdateSettings({ hapticsEnabled: val });
    if (val) haptic.medium(true);
  };

  const handleToggleSound = (val: boolean) => {
    haptic.selection();
    onUpdateSettings({ soundEnabled: val });
  };

  const confirmReset = () => {
    haptic.warning();
    Alert.alert(
      'Reset All Progress',
      'This will reset your statistics, personal best times, and current ongoing game. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            onResetData();
            onClose();
          },
        },
      ]
    );
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
          <Text style={styles.title}>Game Settings</Text>
          <Text style={styles.subtitle}>Preferences & controls</Text>

          {/* Settings Rows */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDesc}>
                  Tactile vibrations on inputs & errors
                </Text>
              </View>
              <Switch
                value={profile.hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#334155', true: '#2563EB' }}
                thumbColor={profile.hapticsEnabled ? '#38BDF8' : '#94A3B8'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDesc}>
                  Game audio tones for clicks & wins
                </Text>
              </View>
              <Switch
                value={profile.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#334155', true: '#2563EB' }}
                thumbColor={profile.soundEnabled ? '#38BDF8' : '#94A3B8'}
              />
            </View>
          </View>

          {/* Reset button */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={confirmReset}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>Reset Statistics & Progress</Text>
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              haptic.selection();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Done</Text>
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
    maxWidth: 360,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 22,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    gap: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resetBtn: {
    width: '100%',
    backgroundColor: '#371A1A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    marginBottom: 12,
  },
  resetBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

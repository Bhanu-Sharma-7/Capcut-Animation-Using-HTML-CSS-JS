import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { UserProfile } from '../types/game';
import { haptic } from '../utils/haptics';

interface ProfileEditModalProps {
  visible: boolean;
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

const AVATARS = ['🧠', '🦊', '👑', '⚡', '🦉', '🚀', '🎯', '🐱'];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  profile,
  onSave,
  onClose,
}) => {
  const [username, setUsername] = useState<string>(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar);

  const handleSave = () => {
    const trimmed = username.trim() || 'Player 1';
    haptic.medium();
    onSave({
      username: trimmed,
      avatar: selectedAvatar,
    });
    onClose();
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
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>
            Customize your player persona and avatar
          </Text>

          {/* Current Avatar preview */}
          <View style={styles.avatarPreviewContainer}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarPreviewEmoji}>{selectedAvatar}</Text>
            </View>
            <Text style={styles.avatarPreviewLabel}>Selected Avatar</Text>
          </View>

          {/* Avatar Grid */}
          <Text style={styles.sectionLabel}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((av) => {
              const isSelected = av === selectedAvatar;
              return (
                <TouchableOpacity
                  key={`avatar-${av}`}
                  style={[
                    styles.avatarOption,
                    isSelected && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    haptic.selection();
                    setSelectedAvatar(av);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{av}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Username Input */}
          <Text style={styles.sectionLabel}>Display Name</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#64748B"
            maxLength={18}
            autoCapitalize="words"
          />

          {/* Action buttons */}
          <View style={styles.btnRow}>
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

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
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
  avatarPreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
    elevation: 4,
  },
  avatarPreviewEmoji: {
    fontSize: 34,
  },
  avatarPreviewLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarOptionSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E3A8A',
    transform: [{ scale: 1.1 }],
  },
  avatarEmoji: {
    fontSize: 22,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
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
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

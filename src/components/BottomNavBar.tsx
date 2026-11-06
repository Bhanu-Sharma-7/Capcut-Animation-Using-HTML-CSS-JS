import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tab } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface BottomNavBarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: AppTheme;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  theme,
}) => {
  const tabs: {
    key: Tab;
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: 'HOME',
      label: 'Home',
      iconActive: 'grid',
      iconInactive: 'grid-outline',
    },
    {
      key: 'PROFILE',
      label: 'Profile',
      iconActive: 'person',
      iconInactive: 'person-outline',
    },
    {
      key: 'SETTINGS',
      label: 'Settings',
      iconActive: 'settings',
      iconInactive: 'settings-outline',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.navBackground,
          borderTopColor: theme.colors.navBorder,
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const iconColor = isActive
            ? theme.colors.navActive
            : theme.colors.navInactive;

          return (
            <TouchableOpacity
              key={`nav-tab-${tab.key}`}
              style={styles.tabButton}
              onPress={() => {
                haptic.selection();
                onTabChange(tab.key);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isActive && {
                    backgroundColor: theme.colors.primarySubtle,
                  },
                ]}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={22}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: iconColor,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

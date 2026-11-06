import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Difficulty } from '../types/game';

const PROFILE_STORAGE_KEY = '@sudoku_user_profile_v1';

export const DEFAULT_PROFILE: UserProfile = {
  username: 'Puzzle Master',
  avatar: '🧠',
  gamesWon: 0,
  bestTimeEasy: null,
  bestTimeMedium: null,
  bestTimeHard: null,
  hapticsEnabled: true,
  soundEnabled: true,
  mediumMatchesCount: 0,
};

export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const json = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to load user profile:', error);
  }
  return DEFAULT_PROFILE;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Failed to save user profile:', error);
  }
}

export async function recordGameWon(
  difficulty: Difficulty,
  timeSeconds: number
): Promise<{ profile: UserProfile; isNewBest: boolean }> {
  const current = await loadUserProfile();
  let isNewBest = false;

  const updated: UserProfile = {
    ...current,
    gamesWon: current.gamesWon + 1,
  };

  if (difficulty === 'Easy') {
    if (current.bestTimeEasy === null || timeSeconds < current.bestTimeEasy) {
      updated.bestTimeEasy = timeSeconds;
      isNewBest = true;
    }
  } else if (difficulty === 'Medium') {
    if (current.bestTimeMedium === null || timeSeconds < current.bestTimeMedium) {
      updated.bestTimeMedium = timeSeconds;
      isNewBest = true;
    }
  } else if (difficulty === 'Hard') {
    if (current.bestTimeHard === null || timeSeconds < current.bestTimeHard) {
      updated.bestTimeHard = timeSeconds;
      isNewBest = true;
    }
  }

  await saveUserProfile(updated);
  return { profile: updated, isNewBest };
}

export async function incrementMediumMatchesCount(): Promise<number> {
  const current = await loadUserProfile();
  const nextCount = current.mediumMatchesCount + 1;
  const updated = { ...current, mediumMatchesCount: nextCount };
  await saveUserProfile(updated);
  return nextCount;
}

export async function resetUserData(): Promise<UserProfile> {
  await saveUserProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}


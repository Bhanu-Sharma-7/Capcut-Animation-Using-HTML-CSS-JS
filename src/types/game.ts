import { ThemeMode } from '../theme/theme';

export type Screen = 'SPLASH' | 'MAIN' | 'GAME';

export type Tab = 'HOME' | 'PROFILE' | 'SETTINGS';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Cell {
  value: number;
  isInitial: boolean;
  notes: number[];
  isError: boolean;
}

export interface MoveHistory {
  row: number;
  col: number;
  prevValue: number;
  prevNotes: number[];
  prevIsError: boolean;
}

export interface UserProfile {
  username: string;
  avatarIcon: string; // vector icon name e.g. 'flash', 'shield', 'trophy', 'rocket', 'star', 'flame', 'bulb', 'compass'
  gamesWon: number;
  winStreak: number;
  bestTimeEasy: number | null;
  bestTimeMedium: number | null;
  bestTimeHard: number | null;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  themeMode: ThemeMode;
  mediumMatchesCount: number;
}

export interface StoredGameState {
  board: Cell[][];
  solutionBoard: number[][];
  difficulty: Difficulty;
  mistakes: number;
  timerSeconds: number;
  hintsLeft: number;
  isNotesMode: boolean;
  history: MoveHistory[];
  isGameOver: boolean;
  isVictory: boolean;
}

export type AdType = 'INTERSTITIAL' | 'REWARDED';

export interface AdRequest {
  type: AdType;
  title: string;
  durationSeconds: number;
  onComplete: () => void;
  onCancel?: () => void;
}

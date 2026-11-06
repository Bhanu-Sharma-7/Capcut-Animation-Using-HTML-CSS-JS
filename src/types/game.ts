export type Screen = 'SPLASH' | 'HOME' | 'GAME';

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
  avatar: string;
  gamesWon: number;
  bestTimeEasy: number | null;
  bestTimeMedium: number | null;
  bestTimeHard: number | null;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
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


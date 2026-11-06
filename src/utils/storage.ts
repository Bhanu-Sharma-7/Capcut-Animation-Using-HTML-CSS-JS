import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cell, MoveHistory, StoredGameState, Difficulty } from '../types/game';

export type { Cell, MoveHistory, StoredGameState, Difficulty };

const STORAGE_KEY = '@sudoku_ongoing_game_v1';

export async function saveGameState(state: StoredGameState): Promise<void> {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.warn('Failed to save Sudoku game state:', error);
  }
}

export async function loadGameState(): Promise<StoredGameState | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const parsed: StoredGameState = JSON.parse(jsonValue);
      if (
        Array.isArray(parsed.board) &&
        parsed.board.length === 9 &&
        Array.isArray(parsed.solutionBoard) &&
        parsed.solutionBoard.length === 9
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load Sudoku game state:', error);
  }
  return null;
}

export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear Sudoku game state:', error);
  }
}

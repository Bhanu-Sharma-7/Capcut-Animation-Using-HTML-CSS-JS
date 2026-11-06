import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  Screen,
  Difficulty,
  Cell,
  MoveHistory,
  UserProfile,
  StoredGameState,
  AdRequest,
} from './src/types/game';
import { generateSudoku } from './src/utils/sudokuGenerator';
import { setHapticsEnabled } from './src/utils/haptics';
import {
  loadUserProfile,
  saveUserProfile,
  recordGameWon,
  incrementMediumMatchesCount,
  resetUserData,
  DEFAULT_PROFILE,
} from './src/utils/profileStorage';
import {
  loadGameState,
  saveGameState,
  clearGameState,
} from './src/utils/storage';
import {
  evaluateDifficultyAdRequirement,
  getHintRewardedAdConfig,
} from './src/services/adService';

import { SplashScreen } from './src/components/SplashScreen';
import { HomeScreen } from './src/components/HomeScreen';
import { GameScreen } from './src/components/GameScreen';
import { SimulatedAdModal } from './src/components/SimulatedAdModal';
import { ProfileEditModal } from './src/components/ProfileEditModal';
import { SettingsModal } from './src/components/SettingsModal';
import { DifficultyModal } from './src/components/DifficultyModal';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Active Game State
  const [ongoingGame, setOngoingGame] = useState<StoredGameState | null>(null);
  const [activeBoard, setActiveBoard] = useState<Cell[][]>([]);
  const [activeSolution, setActiveSolution] = useState<number[][]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('Easy');
  const [activeMistakes, setActiveMistakes] = useState<number>(0);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [activeHintsLeft, setActiveHintsLeft] = useState<number>(3);
  const [activeNotesMode, setActiveNotesMode] = useState<boolean>(false);
  const [activeHistory, setActiveHistory] = useState<MoveHistory[]>([]);

  // Modals Visibility
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);

  // Simulated Ad State
  const [activeAd, setActiveAd] = useState<AdRequest | null>(null);

  // Load profile and stored ongoing game on initial mount
  useEffect(() => {
    async function init() {
      const loadedProfile = await loadUserProfile();
      setProfile(loadedProfile);
      setHapticsEnabled(loadedProfile.hapticsEnabled);

      const savedGame = await loadGameState();
      if (savedGame && !savedGame.isVictory && !savedGame.isGameOver) {
        setOngoingGame(savedGame);
      }
    }
    init();
  }, []);

  // Update profile handler
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    if (updated.hapticsEnabled !== undefined) {
      setHapticsEnabled(updated.hapticsEnabled);
    }
    await saveUserProfile(next);
  };

  // Reset user data handler
  const handleResetData = async () => {
    const defaultProf = await resetUserData();
    setProfile(defaultProf);
    setHapticsEnabled(true);
    await clearGameState();
    setOngoingGame(null);
    setActiveBoard([]);
    setCurrentScreen('HOME');
  };

  // Generate a new puzzle and launch game
  const launchNewGame = useCallback((diff: Difficulty) => {
    const puzzle = generateSudoku(diff);
    const initialCells: Cell[][] = puzzle.initial.map((row) =>
      row.map((val) => ({
        value: val,
        isInitial: val !== 0,
        notes: [],
        isError: false,
      }))
    );

    setActiveDifficulty(diff);
    setActiveSolution(puzzle.solution);
    setActiveBoard(initialCells);
    setActiveMistakes(0);
    setActiveTimerSeconds(0);
    setActiveHintsLeft(3);
    setActiveNotesMode(false);
    setActiveHistory([]);

    const freshState: StoredGameState = {
      board: initialCells,
      solutionBoard: puzzle.solution,
      difficulty: diff,
      mistakes: 0,
      timerSeconds: 0,
      hintsLeft: 3,
      isNotesMode: false,
      history: [],
      isGameOver: false,
      isVictory: false,
    };
    setOngoingGame(freshState);
    saveGameState(freshState);

    setCurrentScreen('GAME');
  }, []);

  // Handle difficulty selection with Ad-wall logic
  const handleSelectDifficulty = async (diff: Difficulty) => {
    setShowDifficultyModal(false);

    let nextMediumMatch = profile.mediumMatchesCount;
    if (diff === 'Medium') {
      nextMediumMatch = await incrementMediumMatchesCount();
      setProfile((prev) => ({ ...prev, mediumMatchesCount: nextMediumMatch }));
    }

    const adDecision = evaluateDifficultyAdRequirement(diff, nextMediumMatch);

    if (adDecision.requiresAd && adDecision.adType) {
      // Trigger simulated Interstitial ad
      setActiveAd({
        type: adDecision.adType,
        title: adDecision.title || 'Sponsor Ad',
        durationSeconds: adDecision.durationSeconds || 4,
        onComplete: () => {
          setActiveAd(null);
          launchNewGame(diff);
        },
      });
    } else {
      // Direct free entry
      launchNewGame(diff);
    }
  };

  // Resume ongoing game from Home
  const handleResumeGame = () => {
    if (!ongoingGame) return;
    setActiveBoard(ongoingGame.board);
    setActiveSolution(ongoingGame.solutionBoard);
    setActiveDifficulty(ongoingGame.difficulty);
    setActiveMistakes(ongoingGame.mistakes);
    setActiveTimerSeconds(ongoingGame.timerSeconds);
    setActiveHintsLeft(ongoingGame.hintsLeft);
    setActiveNotesMode(ongoingGame.isNotesMode);
    setActiveHistory(ongoingGame.history || []);
    setCurrentScreen('GAME');
  };

  // Sync board updates and persist ongoing state
  const handleBoardChange = useCallback(
    (
      board: Cell[][],
      mistakes: number,
      timerSeconds: number,
      hintsLeft: number,
      isNotesMode: boolean,
      history: MoveHistory[]
    ) => {
      setActiveBoard(board);
      setActiveMistakes(mistakes);
      setActiveTimerSeconds(timerSeconds);
      setActiveHintsLeft(hintsLeft);
      setActiveNotesMode(isNotesMode);
      setActiveHistory(history);

      if (board.length === 9 && activeSolution.length === 9) {
        const stateToSave: StoredGameState = {
          board,
          solutionBoard: activeSolution,
          difficulty: activeDifficulty,
          mistakes,
          timerSeconds,
          hintsLeft,
          isNotesMode,
          history,
          isGameOver: mistakes >= 3,
          isVictory: false,
        };
        setOngoingGame(stateToSave);
        saveGameState(stateToSave);
      }
    },
    [activeSolution, activeDifficulty]
  );

  // Victory handler: update career stats and record best time
  const handleVictory = async (diff: Difficulty, timeSeconds: number) => {
    const { profile: updatedProfile } = await recordGameWon(diff, timeSeconds);
    setProfile(updatedProfile);
    await clearGameState();
    setOngoingGame(null);
  };

  // Rewarded Ad flow for in-game hint
  const handleRequestHintAd = (onAdCompleted: () => void) => {
    const config = getHintRewardedAdConfig();
    setActiveAd({
      type: config.adType,
      title: config.title,
      durationSeconds: config.durationSeconds,
      onComplete: () => {
        setActiveAd(null);
        onAdCompleted();
      },
      onCancel: () => {
        setActiveAd(null);
      },
    });
  };

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="light" />

      {/* Screen 1: Splash Screen */}
      {currentScreen === 'SPLASH' && (
        <SplashScreen onFinish={() => setCurrentScreen('HOME')} />
      )}

      {/* Screen 2: Home Screen */}
      {currentScreen === 'HOME' && (
        <HomeScreen
          profile={profile}
          ongoingGame={ongoingGame}
          onPlayGame={() => setShowDifficultyModal(true)}
          onResumeGame={handleResumeGame}
          onOpenProfileEdit={() => setShowProfileModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* Screen 3: Game Screen */}
      {currentScreen === 'GAME' && (
        <GameScreen
          board={activeBoard}
          solutionBoard={activeSolution}
          difficulty={activeDifficulty}
          initialMistakes={activeMistakes}
          initialTimerSeconds={activeTimerSeconds}
          initialHintsLeft={activeHintsLeft}
          initialNotesMode={activeNotesMode}
          initialHistory={activeHistory}
          onBoardChange={handleBoardChange}
          onVictory={handleVictory}
          onGoHome={() => setCurrentScreen('HOME')}
          onOpenDifficultyModal={() => setShowDifficultyModal(true)}
          onRequestHintAd={handleRequestHintAd}
        />
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={showProfileModal}
        profile={profile}
        onSave={handleUpdateProfile}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        profile={profile}
        onUpdateSettings={handleUpdateProfile}
        onResetData={handleResetData}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Difficulty Selection / Ad-Wall Modal */}
      <DifficultyModal
        visible={showDifficultyModal}
        profile={profile}
        currentDifficulty={activeDifficulty}
        onSelectDifficulty={handleSelectDifficulty}
        onClose={() => setShowDifficultyModal(false)}
      />

      {/* Simulated AdMob Ad Modal (Interstitial & Rewarded) */}
      {activeAd && (
        <SimulatedAdModal
          visible={true}
          type={activeAd.type}
          title={activeAd.title}
          durationSeconds={activeAd.durationSeconds}
          onComplete={activeAd.onComplete}
          onCancel={activeAd.onCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090D16',
  },
});

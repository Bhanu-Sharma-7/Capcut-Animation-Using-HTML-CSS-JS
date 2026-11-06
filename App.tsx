import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  Screen,
  Tab,
  Difficulty,
  Cell,
  MoveHistory,
  UserProfile,
  StoredGameState,
  AdRequest,
} from './src/types/game';
import { darkTheme, lightTheme, AppTheme } from './src/theme/theme';
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
import { BottomNavBar } from './src/components/BottomNavBar';
import { HomeScreen } from './src/components/HomeScreen';
import { ProfileScreen } from './src/components/ProfileScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { GameScreen } from './src/components/GameScreen';
import { DifficultyModal } from './src/components/DifficultyModal';
import { SimulatedAdModal } from './src/components/SimulatedAdModal';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [currentTab, setCurrentTab] = useState<Tab>('HOME');

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
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);

  // Simulated Ad State
  const [activeAd, setActiveAd] = useState<AdRequest | null>(null);

  // Resolved dynamic theme
  const theme: AppTheme =
    profile.themeMode === 'light' ? lightTheme : darkTheme;

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

  // Hardware Back Button Handler
  useEffect(() => {
    const onBackPress = () => {
      // 1. If currently in Game, return to Home screen
      if (currentScreen === 'GAME') {
        setCurrentScreen('MAIN');
        setCurrentTab('HOME');
        return true;
      }

      // 2. If in Main screen but on Profile or Settings tab, return to Home tab
      if (currentScreen === 'MAIN') {
        if (currentTab === 'PROFILE' || currentTab === 'SETTINGS') {
          setCurrentTab('HOME');
          return true;
        }

        // 3. If on Home tab, show confirmation dialog before exiting
        if (currentTab === 'HOME') {
          Alert.alert('Exit Sudoku', 'Are you sure you want to exit the app?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Exit',
              style: 'destructive',
              onPress: () => BackHandler.exitApp(),
            },
          ]);
          return true;
        }
      }

      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backSubscription.remove();
  }, [currentScreen, currentTab]);

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
    setCurrentScreen('MAIN');
    setCurrentTab('HOME');
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
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ExpoStatusBar style={profile.themeMode === 'light' ? 'dark' : 'light'} />

      {/* Screen 1: Splash Screen */}
      {currentScreen === 'SPLASH' && (
        <SplashScreen
          onFinish={() => setCurrentScreen('MAIN')}
          theme={theme}
        />
      )}

      {/* Screen 2: Main Tab Navigation (Home, Profile, Settings) */}
      {currentScreen === 'MAIN' && (
        <View style={styles.screenContainer}>
          <View style={styles.tabContent}>
            {currentTab === 'HOME' && (
              <HomeScreen
                profile={profile}
                ongoingGame={ongoingGame}
                theme={theme}
                onSelectDifficulty={handleSelectDifficulty}
                onResumeGame={handleResumeGame}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'PROFILE' && (
              <ProfileScreen
                profile={profile}
                theme={theme}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentTab === 'SETTINGS' && (
              <SettingsScreen
                profile={profile}
                theme={theme}
                onUpdateSettings={handleUpdateProfile}
                onResetData={handleResetData}
              />
            )}
          </View>

          {/* Sleek Instagram-style Bottom Navigation Bar */}
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            theme={theme}
          />
        </View>
      )}

      {/* Screen 3: Fullscreen Sudoku Game */}
      {currentScreen === 'GAME' && (
        <GameScreen
          board={activeBoard}
          solutionBoard={activeSolution}
          difficulty={activeDifficulty}
          theme={theme}
          initialMistakes={activeMistakes}
          initialTimerSeconds={activeTimerSeconds}
          initialHintsLeft={activeHintsLeft}
          initialNotesMode={activeNotesMode}
          initialHistory={activeHistory}
          onBoardChange={handleBoardChange}
          onVictory={handleVictory}
          onGoHome={() => {
            setCurrentScreen('MAIN');
            setCurrentTab('HOME');
          }}
          onOpenDifficultyModal={() => setShowDifficultyModal(true)}
          onRequestHintAd={handleRequestHintAd}
        />
      )}

      {/* Difficulty Selection / Ad-Wall Modal */}
      <DifficultyModal
        visible={showDifficultyModal}
        profile={profile}
        theme={theme}
        currentDifficulty={activeDifficulty}
        onSelectDifficulty={handleSelectDifficulty}
        onClose={() => setShowDifficultyModal(false)}
      />

      {/* Simulated AdMob Ad Modal (Interstitial & Rewarded) */}
      {activeAd && (
        <SimulatedAdModal
          visible={true}
          type={activeAd.type}
          theme={theme}
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
  },
  screenContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cell, MoveHistory, Difficulty } from '../types/game';
import { AppTheme } from '../theme/theme';
import { haptic } from '../utils/haptics';

interface GameScreenProps {
  board: Cell[][];
  solutionBoard: number[][];
  difficulty: Difficulty;
  theme: AppTheme;
  initialMistakes?: number;
  initialTimerSeconds?: number;
  initialHintsLeft?: number;
  initialNotesMode?: boolean;
  initialHistory?: MoveHistory[];
  onBoardChange: (
    board: Cell[][],
    mistakes: number,
    timerSeconds: number,
    hintsLeft: number,
    isNotesMode: boolean,
    history: MoveHistory[]
  ) => void;
  onVictory: (difficulty: Difficulty, timeSeconds: number) => void;
  onGoHome: () => void;
  onOpenDifficultyModal: () => void;
  onRequestHintAd: (onAdCompleted: () => void) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  board: initialBoard,
  solutionBoard,
  difficulty,
  theme,
  initialMistakes = 0,
  initialTimerSeconds = 0,
  initialHintsLeft = 3,
  initialNotesMode = false,
  initialHistory = [],
  onBoardChange,
  onVictory,
  onGoHome,
  onOpenDifficultyModal,
  onRequestHintAd,
}) => {
  const { width, height } = useWindowDimensions();

  // Grid responsiveness
  const maxGridWidth = Math.min(width - 32, height * 0.48, 440);
  const cellSize = Math.floor(maxGridWidth / 9);
  const gridWidth = cellSize * 9;

  // Active game states
  const [board, setBoard] = useState<Cell[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<number>(initialMistakes);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(initialNotesMode);
  const [timerSeconds, setTimerSeconds] = useState<number>(initialTimerSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [history, setHistory] = useState<MoveHistory[]>(initialHistory);
  const [hintsLeft, setHintsLeft] = useState<number>(initialHintsLeft);
  const [showHintConfirmDialog, setShowHintConfirmDialog] = useState<boolean>(false);

  // Sync to parent for offline auto-saving
  useEffect(() => {
    onBoardChange(
      board,
      mistakes,
      timerSeconds,
      hintsLeft,
      isNotesMode,
      history
    );
  }, [board, mistakes, timerSeconds, hintsLeft, isNotesMode, history, onBoardChange]);

  // Timer: strictly runs only while game is active
  useEffect(() => {
    if (isPaused || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, isVictory]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Restart current puzzle
  const handleRestart = useCallback(() => {
    haptic.medium();
    const restarted = board.map((row) =>
      row.map((cell) => ({
        value: cell.isInitial ? cell.value : 0,
        isInitial: cell.isInitial,
        notes: [],
        isError: false,
      }))
    );
    setBoard(restarted);
    setSelectedCell(null);
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setHistory([]);
    setHintsLeft(3);
  }, [board]);

  // Check victory condition
  const checkVictory = (currentBoard: Cell[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (
          currentBoard[r][c].value === 0 ||
          currentBoard[r][c].value !== solutionBoard[r][c]
        ) {
          return false;
        }
      }
    }
    return true;
  };

  // Cell selection
  const handleCellSelect = (r: number, c: number) => {
    haptic.selection();
    setSelectedCell([r, c]);
  };

  // Number selection handler (from numpad)
  const handleNumberPress = (num: number) => {
    if (!selectedCell || isPaused || isGameOver || isVictory) return;
    const [row, col] = selectedCell;
    const targetCell = board[row][col];

    // Protect initial clues
    if (targetCell.isInitial) return;

    if (isNotesMode) {
      haptic.selection();
      const currentNotes = [...targetCell.notes];
      const noteIndex = currentNotes.indexOf(num);
      let updatedNotes: number[];
      if (noteIndex > -1) {
        updatedNotes = currentNotes.filter((n) => n !== num);
      } else {
        updatedNotes = [...currentNotes, num].sort((a, b) => a - b);
      }

      setHistory((prev) => [
        ...prev,
        {
          row,
          col,
          prevValue: targetCell.value,
          prevNotes: targetCell.notes,
          prevIsError: targetCell.isError,
        },
      ]);

      setBoard((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        next[row][col].notes = updatedNotes;
        return next;
      });
      return;
    }

    // Normal filling mode
    const isCorrect = solutionBoard[row][col] === num;
    const nextErrorState = !isCorrect;

    if (isCorrect) {
      haptic.light();
    } else {
      haptic.error();
    }

    setHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: targetCell.value,
        prevNotes: targetCell.notes,
        prevIsError: targetCell.isError,
      },
    ]);

    const newBoard = board.map((r, rIdx) =>
      r.map((c, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return {
            ...c,
            value: num,
            notes: [],
            isError: nextErrorState,
          };
        }
        return { ...c };
      })
    );

    setBoard(newBoard);

    if (!isCorrect) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (nextMistakes >= 3) {
        haptic.warning();
        setIsGameOver(true);
      }
    } else {
      if (checkVictory(newBoard)) {
        haptic.success();
        setIsVictory(true);
        onVictory(difficulty, timerSeconds);
      }
    }
  };

  // Erase functionality (protects initial clues)
  const handleErase = () => {
    if (!selectedCell || isPaused || isGameOver || isVictory) return;
    const [row, col] = selectedCell;
    const targetCell = board[row][col];

    if (targetCell.isInitial) return;
    if (targetCell.value === 0 && targetCell.notes.length === 0) return;

    haptic.light();

    setHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: targetCell.value,
        prevNotes: targetCell.notes,
        prevIsError: targetCell.isError,
      },
    ]);

    setBoard((prev) => {
      const next = prev.map((r, rIdx) =>
        r.map((c, cIdx) => {
          if (rIdx === row && cIdx === col) {
            return {
              ...c,
              value: 0,
              notes: [],
              isError: false,
            };
          }
          return { ...c };
        })
      );
      return next;
    });
  };

  // Undo functionality
  const handleUndo = () => {
    if (history.length === 0 || isPaused || isGameOver || isVictory) return;
    haptic.light();
    const lastMove = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));

    setBoard((prev) => {
      const next = prev.map((r, rIdx) =>
        r.map((c, cIdx) => {
          if (rIdx === lastMove.row && cIdx === lastMove.col) {
            return {
              ...c,
              value: lastMove.prevValue,
              notes: lastMove.prevNotes,
              isError: lastMove.prevIsError,
            };
          }
          return { ...c };
        })
      );
      return next;
    });
    setSelectedCell([lastMove.row, lastMove.col]);
  };

  // Hint execution after rewarded ad completes
  const executeHint = () => {
    let targetRow = -1;
    let targetCol = -1;

    // Prioritize selected cell if empty/incorrect and not initial
    if (
      selectedCell &&
      !board[selectedCell[0]][selectedCell[1]].isInitial &&
      board[selectedCell[0]][selectedCell[1]].value !==
        solutionBoard[selectedCell[0]][selectedCell[1]]
    ) {
      targetRow = selectedCell[0];
      targetCol = selectedCell[1];
    } else {
      // Find first empty cell
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].value === 0) {
            targetRow = r;
            targetCol = c;
            break;
          }
        }
        if (targetRow !== -1) break;
      }
    }

    if (targetRow === -1) return;

    const correctVal = solutionBoard[targetRow][targetCol];

    const newBoard = board.map((r, rIdx) =>
      r.map((c, cIdx) => {
        if (rIdx === targetRow && cIdx === targetCol) {
          return {
            ...c,
            value: correctVal,
            notes: [],
            isError: false,
          };
        }
        return { ...c };
      })
    );

    setBoard(newBoard);
    setSelectedCell([targetRow, targetCol]);
    setHintsLeft((prev) => prev - 1);
    haptic.success();

    if (checkVictory(newBoard)) {
      setIsVictory(true);
      onVictory(difficulty, timerSeconds);
    }
  };

  // Trigger hint rewarded flow
  const handleHintPress = () => {
    if (isPaused || isGameOver || isVictory) return;
    haptic.selection();
    setShowHintConfirmDialog(true);
  };

  const handleConfirmWatchAdForHint = () => {
    setShowHintConfirmDialog(false);
    onRequestHintAd(() => {
      executeHint();
    });
  };

  // Remaining counts for numpad buttons (1-9)
  const remainingCounts: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) {
    let placed = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].value === d && !board[r][c].isError) {
          placed++;
        }
      }
    }
    remainingCounts[d] = Math.max(0, 9 - placed);
  }

  // Selected cell helper values
  const selectedValue =
    selectedCell ? board[selectedCell[0]][selectedCell[1]].value : 0;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.container}>
        {/* Top Header with Clean Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => {
              haptic.selection();
              onGoHome();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.colors.text}
            />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.difficultyBadge,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.primaryLight,
              },
            ]}
            onPress={() => {
              haptic.selection();
              onOpenDifficultyModal();
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: theme.colors.primaryLight },
              ]}
            >
              {difficulty}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={theme.colors.primaryLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.newGameBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => {
              haptic.selection();
              onOpenDifficultyModal();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh"
              size={15}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.newGameBtnText,
                { color: theme.colors.textSecondary },
              ]}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Bar: Mistakes & Timer with Pause */}
        <View
          style={[
            styles.statusBarCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.mistakesContainer}>
            <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>
              Mistakes
            </Text>
            <View
              style={[
                styles.mistakesPill,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.mistakesValue,
                  { color: theme.colors.text },
                  mistakes > 0 && { color: theme.colors.error },
                ]}
              >
                {mistakes}/3
              </Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>
              Time
            </Text>
            <View
              style={[
                styles.timerPill,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  { color: theme.colors.primaryLight },
                ]}
              >
                {formatTime(timerSeconds)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setIsPaused((prev) => !prev);
                }}
                style={styles.pauseBtn}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={14}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 9x9 Sudoku Board */}
        <View
          style={[
            styles.boardWrapper,
            {
              width: gridWidth,
              height: gridWidth,
              backgroundColor: theme.colors.boardBackground,
              borderColor: theme.colors.boardBorder,
            },
          ]}
        >
          <View style={[styles.board, { width: gridWidth, height: gridWidth }]}>
            {board.map((row, rIdx) => (
              <View key={`row-${rIdx}`} style={styles.gridRow}>
                {row.map((cell, cIdx) => {
                  const isSelected =
                    selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx;

                  const isSameBlock =
                    selectedCell &&
                    Math.floor(selectedCell[0] / 3) === Math.floor(rIdx / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(cIdx / 3);

                  const isSameRowOrCol =
                    selectedCell &&
                    (selectedCell[0] === rIdx || selectedCell[1] === cIdx);

                  const isRelated = isSameBlock || isSameRowOrCol;

                  const isSameNumber =
                    selectedValue > 0 &&
                    cell.value === selectedValue &&
                    !isSelected;

                  // Distinct 3x3 block borders
                  const borderRightThick = cIdx % 3 === 2 && cIdx !== 8;
                  const borderBottomThick = rIdx % 3 === 2 && rIdx !== 8;

                  let cellBg = theme.colors.cellDefault;
                  if (cell.isError) cellBg = theme.colors.cellError;
                  else if (isSelected) cellBg = theme.colors.cellSelected;
                  else if (isSameNumber) cellBg = theme.colors.cellSameNumber;
                  else if (isRelated) cellBg = theme.colors.cellRelated;

                  let cellTextColor = theme.colors.userNumberText;
                  if (cell.isError) cellTextColor = theme.colors.errorNumberText;
                  else if (isSelected) cellTextColor = theme.colors.selectedNumberText;
                  else if (cell.isInitial) cellTextColor = theme.colors.initialClueText;

                  return (
                    <TouchableOpacity
                      key={`cell-${rIdx}-${cIdx}`}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: cellBg,
                          borderRightWidth: borderRightThick ? 2.5 : cIdx === 8 ? 0 : 0.8,
                          borderBottomWidth: borderBottomThick ? 2.5 : rIdx === 8 ? 0 : 0.8,
                          borderRightColor: borderRightThick
                            ? theme.colors.gridDividerThick
                            : theme.colors.gridDividerThin,
                          borderBottomColor: borderBottomThick
                            ? theme.colors.gridDividerThick
                            : theme.colors.gridDividerThin,
                        },
                      ]}
                      onPress={() => handleCellSelect(rIdx, cIdx)}
                      activeOpacity={0.8}
                    >
                      {cell.value !== 0 ? (
                        <Text
                          style={[
                            styles.cellNumber,
                            {
                              fontSize: Math.floor(cellSize * 0.58),
                              color: cellTextColor,
                              fontWeight: cell.isInitial ? '800' : '700',
                            },
                          ]}
                        >
                          {cell.value}
                        </Text>
                      ) : (
                        // 3x3 Notes mini-grid inside empty cell
                        <View style={styles.notesGrid}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <View key={`note-${n}`} style={styles.noteSlot}>
                              <Text
                                style={[
                                  styles.noteText,
                                  {
                                    fontSize: Math.max(8, Math.floor(cellSize * 0.22)),
                                    color: theme.colors.noteText,
                                    opacity: cell.notes.includes(n) ? 1 : 0,
                                  },
                                ]}
                              >
                                {n}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Pause Overlay */}
          {isPaused && (
            <View
              style={[
                styles.pauseOverlay,
                {
                  backgroundColor:
                    theme.mode === 'dark'
                      ? 'rgba(9, 13, 22, 0.96)'
                      : 'rgba(241, 245, 249, 0.96)',
                },
              ]}
            >
              <Ionicons
                name="pause-circle-outline"
                size={48}
                color={theme.colors.primaryLight}
              />
              <Text style={[styles.pauseOverlayTitle, { color: theme.colors.text }]}>
                Game Paused
              </Text>
              <TouchableOpacity
                style={[
                  styles.resumeBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => {
                  haptic.selection();
                  setIsPaused(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.resumeBtnText}>Resume</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons: Undo, Erase, Notes, Hint */}
        <View style={styles.actionRow}>
          {/* Undo */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
              history.length === 0 && styles.actionBtnDisabled,
            ]}
            onPress={handleUndo}
            disabled={history.length === 0}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Undo
            </Text>
          </TouchableOpacity>

          {/* Erase */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={handleErase}
            activeOpacity={0.7}
          >
            <Ionicons
              name="backspace-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Erase
            </Text>
          </TouchableOpacity>

          {/* Notes Toggle */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isNotesMode
                  ? theme.colors.primarySubtle
                  : theme.colors.card,
                borderColor: isNotesMode
                  ? theme.colors.primaryLight
                  : theme.colors.cardBorder,
              },
            ]}
            onPress={() => {
              haptic.selection();
              setIsNotesMode((prev) => !prev);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.notesIconContainer}>
              <Ionicons
                name="create-outline"
                size={18}
                color={
                  isNotesMode
                    ? theme.colors.primaryLight
                    : theme.colors.textSecondary
                }
              />
              <View
                style={[
                  styles.notesToggleTag,
                  {
                    backgroundColor: isNotesMode
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.notesToggleTagText,
                    {
                      color: isNotesMode
                        ? '#FFFFFF'
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  {isNotesMode ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.actionLabel,
                {
                  color: isNotesMode
                    ? theme.colors.primaryLight
                    : theme.colors.textSecondary,
                },
              ]}
            >
              Notes
            </Text>
          </TouchableOpacity>

          {/* Hint with AD badge */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={handleHintPress}
            activeOpacity={0.7}
          >
            <View style={styles.hintBadgeWrapper}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={theme.colors.warning}
              />
              <View
                style={[
                  styles.adHintTag,
                  { backgroundColor: theme.colors.warning },
                ]}
              >
                <Text style={styles.adHintTagText}>AD</Text>
              </View>
            </View>
            <Text
              style={[
                styles.actionLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Hint
            </Text>
          </TouchableOpacity>
        </View>

        {/* Number Pad (1 to 9) */}
        <View style={styles.numpadContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const remaining = remainingCounts[num];
            const isCompleted = remaining === 0;

            return (
              <TouchableOpacity
                key={`numpad-${num}`}
                style={[
                  styles.numBtn,
                  {
                    backgroundColor: isCompleted
                      ? theme.colors.surface
                      : theme.colors.card,
                    borderColor: theme.colors.cardBorder,
                  },
                  isCompleted && styles.numBtnCompleted,
                ]}
                onPress={() => handleNumberPress(num)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.numBtnText,
                    {
                      color: isCompleted
                        ? theme.colors.textMuted
                        : theme.colors.text,
                    },
                  ]}
                >
                  {num}
                </Text>
                <Text
                  style={[
                    styles.numCountBadge,
                    {
                      color: isCompleted
                        ? theme.colors.success
                        : theme.colors.primaryLight,
                    },
                  ]}
                >
                  {isCompleted ? '✓' : remaining}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Watch Ad for Hint Confirmation Dialog */}
        <Modal
          visible={showHintConfirmDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHintConfirmDialog(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dialogIconBox,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="bulb"
                  size={28}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Watch Ad for Hint?
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Watch a short sponsor video to reveal the correct number for your
                selected cell.
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[
                    styles.modalSecondaryBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                  onPress={() => setShowHintConfirmDialog(false)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalSecondaryBtnText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalPrimaryBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleConfirmWatchAdForHint}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryBtnText}>Watch Ad</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Victory Modal */}
        <Modal
          visible={isVictory}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dialogIconBox,
                  { backgroundColor: theme.colors.successSubtle },
                ]}
              >
                <Ionicons
                  name="trophy"
                  size={32}
                  color={theme.colors.success}
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Puzzle Solved!
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                You conquered the{' '}
                <Text
                  style={[
                    styles.modalHighlight,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  {difficulty}
                </Text>{' '}
                puzzle in{' '}
                <Text
                  style={[
                    styles.modalHighlight,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  {formatTime(timerSeconds)}
                </Text>{' '}
                with{' '}
                <Text
                  style={[
                    styles.modalHighlight,
                    { color: theme.colors.primaryLight },
                  ]}
                >
                  {mistakes}
                </Text>{' '}
                mistake{mistakes === 1 ? '' : 's'}!
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[
                    styles.modalSecondaryBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                  onPress={onGoHome}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalSecondaryBtnText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalPrimaryBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={onOpenDifficultyModal}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryBtnText}>New Puzzle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <Modal
          visible={isGameOver}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dialogIconBox,
                  { backgroundColor: theme.colors.errorSubtle },
                ]}
              >
                <Ionicons
                  name="skull-outline"
                  size={32}
                  color={theme.colors.error}
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Game Over
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                You accumulated 3 mistakes in this puzzle. Review your strategy
                and try again!
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[
                    styles.modalSecondaryBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                  onPress={onGoHome}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalSecondaryBtnText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalPrimaryBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleRestart}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  newGameBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBarCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  mistakesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  mistakesPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mistakesValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pauseBtn: {
    padding: 3,
    borderRadius: 4,
  },
  boardWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 3,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  board: {},
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellNumber: {
    fontWeight: '700',
  },
  notesGrid: {
    width: '90%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSlot: {
    width: '33.3%',
    height: '33.3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontWeight: '600',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pauseOverlayTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 68,
    gap: 2,
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  notesToggleTag: {
    position: 'absolute',
    top: -4,
    right: -16,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  notesToggleTagText: {
    fontSize: 8,
    fontWeight: '800',
  },
  hintBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  adHintTag: {
    position: 'absolute',
    top: -4,
    right: -14,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adHintTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
  },
  numpadContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 4,
  },
  numBtn: {
    flex: 1,
    aspectRatio: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    elevation: 2,
  },
  numBtnCompleted: {
    opacity: 0.45,
  },
  numBtnText: {
    fontSize: 22,
    fontWeight: '700',
  },
  numCountBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalHighlight: {
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Base Easy Puzzle (classic unique puzzle)
const BASE_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const BASE_INITIAL = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

interface Cell {
  value: number;
  isInitial: boolean;
  notes: number[];
  isError: boolean;
}

interface MoveHistory {
  row: number;
  col: number;
  prevValue: number;
  prevNotes: number[];
  prevIsError: boolean;
}

// Generate valid isomorphic permutations so every "New Game" is fresh
function createPermutedPuzzle() {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle digits for digit mapping
  const shuffled = [...digits].sort(() => Math.random() - 0.5);
  const map: Record<number, number> = {};
  for (let i = 0; i < 9; i++) {
    map[digits[i]] = shuffled[i];
  }

  const newInit = BASE_INITIAL.map((row) =>
    row.map((val) => (val === 0 ? 0 : map[val]))
  );
  const newSol = BASE_SOLUTION.map((row) =>
    row.map((val) => map[val])
  );

  // Randomly swap rows within 3x3 bands
  for (let b = 0; b < 3; b++) {
    const rowIndices = [0, 1, 2].sort(() => Math.random() - 0.5);
    const bandInit = [newInit[b * 3], newInit[b * 3 + 1], newInit[b * 3 + 2]];
    const bandSol = [newSol[b * 3], newSol[b * 3 + 1], newSol[b * 3 + 2]];
    for (let r = 0; r < 3; r++) {
      newInit[b * 3 + r] = bandInit[rowIndices[r]];
      newSol[b * 3 + r] = bandSol[rowIndices[r]];
    }
  }

  // Randomly swap columns within 3x3 stacks
  for (let b = 0; b < 3; b++) {
    const colIndices = [0, 1, 2].sort(() => Math.random() - 0.5);
    for (let r = 0; r < 9; r++) {
      const origColsInit = [
        newInit[r][b * 3],
        newInit[r][b * 3 + 1],
        newInit[r][b * 3 + 2],
      ];
      const origColsSol = [
        newSol[r][b * 3],
        newSol[r][b * 3 + 1],
        newSol[r][b * 3 + 2],
      ];
      for (let c = 0; c < 3; c++) {
        newInit[r][b * 3 + c] = origColsInit[colIndices[c]];
        newSol[r][b * 3 + c] = origColsSol[colIndices[c]];
      }
    }
  }

  return { initial: newInit, solution: newSol };
}

export default function App() {
  const { width, height } = useWindowDimensions();

  // Responsive grid dimension calculation
  // Reserve space for header, status bar, action buttons and numpad
  const maxGridWidth = Math.min(width - 32, height * 0.48, 440);
  const cellSize = Math.floor(maxGridWidth / 9);
  const gridWidth = cellSize * 9;

  // Game state
  const [solutionBoard, setSolutionBoard] = useState<number[][]>(BASE_SOLUTION);
  const [board, setBoard] = useState<Cell[][]>(() =>
    BASE_INITIAL.map((row) =>
      row.map((val) => ({
        value: val,
        isInitial: val !== 0,
        notes: [],
        isError: false,
      }))
    )
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [hintsLeft, setHintsLeft] = useState<number>(3);

  // Timer effect
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

  // Start a new game
  const handleNewGame = useCallback(() => {
    const { initial, solution } = createPermutedPuzzle();
    setSolutionBoard(solution);
    setBoard(
      initial.map((row) =>
        row.map((val) => ({
          value: val,
          isInitial: val !== 0,
          notes: [],
          isError: false,
        }))
      )
    );
    setSelectedCell(null);
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setHistory([]);
    setHintsLeft(3);
  }, []);

  // Restart current puzzle
  const handleRestart = useCallback(() => {
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((cell) => ({
          value: cell.isInitial ? cell.value : 0,
          isInitial: cell.isInitial,
          notes: [],
          isError: false,
        }))
      )
    );
    setSelectedCell(null);
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setHistory([]);
    setHintsLeft(3);
  }, []);

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

  // Number selection handler (from numpad)
  const handleNumberPress = (num: number) => {
    if (!selectedCell || isPaused || isGameOver || isVictory) return;
    const [row, col] = selectedCell;
    const targetCell = board[row][col];

    // Protect initial clues
    if (targetCell.isInitial) return;

    if (isNotesMode) {
      // Toggle note candidate
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
        setIsGameOver(true);
      }
    } else {
      if (checkVictory(newBoard)) {
        setIsVictory(true);
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

  // Hint functionality
  const handleHint = () => {
    if (hintsLeft <= 0 || isPaused || isGameOver || isVictory) return;

    let targetRow = -1;
    let targetCol = -1;

    // If current selected cell is empty or incorrect and not initial, fill it
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

    if (checkVictory(newBoard)) {
      setIsVictory(true);
    }
  };

  // Calculate remaining counts for numpad buttons (1-9)
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
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />

      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>SUDOKU</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>Easy</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.newGameBtn}
            onPress={handleNewGame}
            activeOpacity={0.7}
          >
            <Text style={styles.newGameBtnText}>New Game</Text>
          </TouchableOpacity>
        </View>

        {/* Status Bar: Mistakes & Timer with Pause */}
        <View style={styles.statusBarCard}>
          <View style={styles.mistakesContainer}>
            <Text style={styles.statusLabel}>Mistakes</Text>
            <View style={styles.mistakesPill}>
              <Text
                style={[
                  styles.mistakesValue,
                  mistakes > 0 && styles.mistakesAlert,
                ]}
              >
                {mistakes}/3
              </Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.statusLabel}>Time</Text>
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
              <TouchableOpacity
                onPress={() => setIsPaused((prev) => !prev)}
                style={styles.pauseBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.pauseBtnIcon}>
                  {isPaused ? '▶' : '⏸'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 9x9 Sudoku Board Container */}
        <View style={[styles.boardWrapper, { width: gridWidth, height: gridWidth }]}>
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

                  // Dynamic borders for 3x3 blocks
                  const borderRightThick = cIdx % 3 === 2 && cIdx !== 8;
                  const borderBottomThick = rIdx % 3 === 2 && rIdx !== 8;

                  return (
                    <TouchableOpacity
                      key={`cell-${rIdx}-${cIdx}`}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          borderRightWidth: borderRightThick ? 2.5 : cIdx === 8 ? 0 : 0.8,
                          borderBottomWidth: borderBottomThick ? 2.5 : rIdx === 8 ? 0 : 0.8,
                          borderRightColor: borderRightThick ? '#64748B' : '#2D3748',
                          borderBottomColor: borderBottomThick ? '#64748B' : '#2D3748',
                        },
                        isRelated && styles.cellRelated,
                        isSameNumber && styles.cellSameNumber,
                        isSelected && styles.cellSelected,
                        cell.isError && styles.cellError,
                      ]}
                      onPress={() => setSelectedCell([rIdx, cIdx])}
                      activeOpacity={0.8}
                    >
                      {cell.value !== 0 ? (
                        <Text
                          style={[
                            styles.cellNumber,
                            { fontSize: Math.floor(cellSize * 0.58) },
                            cell.isInitial && styles.initialClueText,
                            !cell.isInitial && styles.userNumberText,
                            isSelected && styles.selectedCellNumberText,
                            cell.isError && styles.errorNumberText,
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
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseOverlayIcon}>⏸</Text>
              <Text style={styles.pauseOverlayTitle}>Game Paused</Text>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={() => setIsPaused(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.resumeBtnText}>▶  Resume</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons: Undo, Erase, Notes, Hint */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, history.length === 0 && styles.actionBtnDisabled]}
            onPress={handleUndo}
            disabled={history.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>↩</Text>
            <Text style={styles.actionLabel}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleErase}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>⌫</Text>
            <Text style={styles.actionLabel}>Erase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isNotesMode && styles.actionBtnNotesActive,
            ]}
            onPress={() => setIsNotesMode((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={styles.notesIconContainer}>
              <Text
                style={[
                  styles.actionIcon,
                  isNotesMode && styles.actionIconActive,
                ]}
              >
                ✎
              </Text>
              <View
                style={[
                  styles.notesToggleTag,
                  isNotesMode && styles.notesToggleTagOn,
                ]}
              >
                <Text style={styles.notesToggleTagText}>
                  {isNotesMode ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.actionLabel,
                isNotesMode && styles.actionLabelActive,
              ]}
            >
              Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, hintsLeft === 0 && styles.actionBtnDisabled]}
            onPress={handleHint}
            disabled={hintsLeft === 0}
            activeOpacity={0.7}
          >
            <View style={styles.hintBadgeWrapper}>
              <Text style={styles.actionIcon}>💡</Text>
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>{hintsLeft}</Text>
              </View>
            </View>
            <Text style={styles.actionLabel}>Hint</Text>
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
                  isCompleted && styles.numBtnCompleted,
                ]}
                onPress={() => handleNumberPress(num)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.numBtnText,
                    isCompleted && styles.numBtnTextCompleted,
                  ]}
                >
                  {num}
                </Text>
                <Text
                  style={[
                    styles.numCountBadge,
                    isCompleted && styles.numCountBadgeCompleted,
                  ]}
                >
                  {isCompleted ? '✓' : remaining}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Victory Modal */}
        <Modal
          visible={isVictory}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={styles.modalTitle}>Puzzle Solved!</Text>
              <Text style={styles.modalSubtitle}>
                Outstanding performance! You completed the puzzle in{' '}
                <Text style={styles.modalHighlight}>
                  {formatTime(timerSeconds)}
                </Text>{' '}
                with{' '}
                <Text style={styles.modalHighlight}>{mistakes}</Text> mistake
                {mistakes === 1 ? '' : 's'}.
              </Text>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleNewGame}
                activeOpacity={0.8}
              >
                <Text style={styles.modalPrimaryBtnText}>Play New Game</Text>
              </TouchableOpacity>
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
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>💔</Text>
              <Text style={styles.modalTitle}>Game Over</Text>
              <Text style={styles.modalSubtitle}>
                You accumulated 3 mistakes in this puzzle. Review your strategy
                and try again!
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={handleRestart}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSecondaryBtnText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleNewGame}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalPrimaryBtnText}>New Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Header Styles
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#F8FAFC',
  },
  difficultyBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  difficultyText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newGameBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  newGameBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  // Status Bar
  statusBarCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
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
    color: '#9CA3AF',
  },
  mistakesPill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mistakesValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  mistakesAlert: {
    color: '#EF4444',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
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
    color: '#38BDF8',
  },
  pauseBtn: {
    padding: 3,
    borderRadius: 4,
  },
  pauseBtnIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // 9x9 Board
  boardWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 3,
    borderColor: '#64748B',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  board: {
    backgroundColor: '#0F172A',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  cellRelated: {
    backgroundColor: '#1E293B',
  },
  cellSameNumber: {
    backgroundColor: '#1E3A5F',
  },
  cellSelected: {
    backgroundColor: '#2563EB',
  },
  cellError: {
    backgroundColor: '#451A1A',
  },
  cellNumber: {
    fontWeight: '700',
  },
  initialClueText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  userNumberText: {
    color: '#38BDF8',
  },
  selectedCellNumberText: {
    color: '#FFFFFF',
  },
  errorNumberText: {
    color: '#F87171',
  },

  // Notes mini-grid (3x3 inside cell)
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
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Pause Overlay
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pauseOverlayIcon: {
    fontSize: 40,
    color: '#38BDF8',
  },
  pauseOverlayTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resumeBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Action Buttons
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    minWidth: 68,
  },
  actionBtnNotesActive: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  actionIcon: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 2,
  },
  actionIconActive: {
    color: '#38BDF8',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  actionLabelActive: {
    color: '#38BDF8',
  },
  notesIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  notesToggleTag: {
    position: 'absolute',
    top: -4,
    right: -16,
    backgroundColor: '#374151',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  notesToggleTagOn: {
    backgroundColor: '#2563EB',
  },
  notesToggleTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hintBadgeWrapper: {
    position: 'relative',
  },
  hintBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#2563EB',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Number Pad
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
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 2,
  },
  numBtnCompleted: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    opacity: 0.45,
  },
  numBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  numBtnTextCompleted: {
    color: '#64748B',
  },
  numCountBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 2,
  },
  numCountBadgeCompleted: {
    color: '#10B981',
  },

  // Modals
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
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
});

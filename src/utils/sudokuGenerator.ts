export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface GeneratedSudoku {
  initial: number[][];
  solution: number[][];
  clues: number;
  difficulty: Difficulty;
}

const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  Easy: 38,
  Medium: 30,
  Hard: 24,
};

function createEmptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function isValid(
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) {
      return false;
    }
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) {
        return false;
      }
    }
  }

  return true;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Backtracking solver to populate complete boards
export function solveBoard(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solveBoard(board)) {
              return true;
            }
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Count solutions up to `limit` using Minimum Remaining Values (MRV) heuristic for speed
export function countSolutions(
  board: number[][],
  count = { value: 0 },
  limit = 2
): number {
  let minRow = -1;
  let minCol = -1;
  let minCandidates = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let candidates = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) candidates++;
        }
        if (candidates < minCandidates) {
          minCandidates = candidates;
          minRow = r;
          minCol = c;
          if (candidates === 0) return count.value; // dead-end early pruning
        }
      }
    }
  }

  // All cells filled
  if (minRow === -1) {
    count.value++;
    return count.value;
  }

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, minRow, minCol, num)) {
      board[minRow][minCol] = num;
      countSolutions(board, count, limit);
      board[minRow][minCol] = 0;
      if (count.value >= limit) {
        return count.value;
      }
    }
  }

  return count.value;
}

/**
 * Generate a complete, uniquely solvable Sudoku puzzle
 * based on selected difficulty.
 */
export function generateSudoku(difficulty: Difficulty): GeneratedSudoku {
  const targetClues = DIFFICULTY_CLUES[difficulty];
  const board = createEmptyBoard();

  // 1. Fill the 3 independent diagonal 3x3 boxes with random permutations
  for (let b = 0; b < 3; b++) {
    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[b * 3 + r][b * 3 + c] = numbers[idx++];
      }
    }
  }

  // 2. Solve the rest of the board using backtracking
  solveBoard(board);
  const solution = board.map((row) => [...row]);

  // 3. Randomize all 81 cell coordinates
  const cells: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push([r, c]);
    }
  }
  const shuffledCells = shuffle(cells);

  // 4. Dig cells one by one, checking unique solvability
  let currentClues = 81;
  for (const [r, c] of shuffledCells) {
    if (currentClues <= targetClues) {
      break;
    }

    const originalValue = board[r][c];
    board[r][c] = 0;

    const counter = { value: 0 };
    countSolutions(board, counter, 2);

    if (counter.value !== 1) {
      // Not unique solution, revert
      board[r][c] = originalValue;
    } else {
      currentClues--;
    }
  }

  return {
    initial: board,
    solution,
    clues: currentClues,
    difficulty,
  };
}


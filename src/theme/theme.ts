export type ThemeMode = 'dark' | 'light';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    card: string;
    cardBorder: string;
    divider: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    primarySubtle: string;
    accent: string;
    success: string;
    successSubtle: string;
    warning: string;
    warningSubtle: string;
    error: string;
    errorSubtle: string;

    // Sudoku Board specific
    boardBackground: string;
    boardBorder: string;
    gridDividerThick: string;
    gridDividerThin: string;
    cellDefault: string;
    cellRelated: string;
    cellSameNumber: string;
    cellSelected: string;
    cellError: string;
    initialClueText: string;
    userNumberText: string;
    selectedNumberText: string;
    errorNumberText: string;
    noteText: string;

    // Bottom Navigation
    navBackground: string;
    navBorder: string;
    navActive: string;
    navInactive: string;
  };
}

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#090D16',
    surface: '#111827',
    card: '#1E293B',
    cardBorder: '#334155',
    divider: '#1F2937',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#2563EB',
    primaryLight: '#38BDF8',
    primarySubtle: '#1E3A8A',
    accent: '#06B6D4',
    success: '#10B981',
    successSubtle: '#064E3B',
    warning: '#F59E0B',
    warningSubtle: '#451A03',
    error: '#EF4444',
    errorSubtle: '#451A1A',

    boardBackground: '#0F172A',
    boardBorder: '#64748B',
    gridDividerThick: '#64748B',
    gridDividerThin: '#1E293B',
    cellDefault: '#0F172A',
    cellRelated: '#1E293B',
    cellSameNumber: '#1E3A5F',
    cellSelected: '#2563EB',
    cellError: '#451A1A',
    initialClueText: '#F8FAFC',
    userNumberText: '#38BDF8',
    selectedNumberText: '#FFFFFF',
    errorNumberText: '#F87171',
    noteText: '#94A3B8',

    navBackground: '#0F172A',
    navBorder: '#1E293B',
    navActive: '#38BDF8',
    navInactive: '#64748B',
  },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F1F5F9',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    divider: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primaryLight: '#0284C7',
    primarySubtle: '#DBEAFE',
    accent: '#0284C7',
    success: '#059669',
    successSubtle: '#D1FAE5',
    warning: '#D97706',
    warningSubtle: '#FEF3C7',
    error: '#DC2626',
    errorSubtle: '#FEE2E2',

    boardBackground: '#FFFFFF',
    boardBorder: '#475569',
    gridDividerThick: '#475569',
    gridDividerThin: '#E2E8F0',
    cellDefault: '#FFFFFF',
    cellRelated: '#F1F5F9',
    cellSameNumber: '#BAE6FD',
    cellSelected: '#2563EB',
    cellError: '#FEE2E2',
    initialClueText: '#0F172A',
    userNumberText: '#0284C7',
    selectedNumberText: '#FFFFFF',
    errorNumberText: '#DC2626',
    noteText: '#64748B',

    navBackground: '#FFFFFF',
    navBorder: '#E2E8F0',
    navActive: '#2563EB',
    navInactive: '#94A3B8',
  },
};


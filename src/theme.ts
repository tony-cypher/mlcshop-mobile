export interface ThemeColors {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentBorder: string;
  accentContrast: string;
  bg: string;
  surface: string;
  surface2: string;
  panel: string;
  tile: string;
  tileStrong: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  star: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  chip: string;
}

export const lightColors: ThemeColors = {
  accent: '#4f46e5',
  accentStrong: '#4338ca',
  accentSoft: '#eef2ff',
  accentBorder: '#c7d2fe',
  accentContrast: '#ffffff',
  bg: '#f5f6f8',
  surface: '#ffffff',
  surface2: '#f4f5f8',
  panel: '#fafbfc',
  tile: '#f3f4f7',
  tileStrong: '#e8eaf0',
  border: '#e6e8ee',
  borderStrong: '#d6dae3',
  text: '#0f1117',
  text2: '#5b6070',
  text3: '#8d93a3',
  star: '#f59e0b',
  success: '#15803d',
  successSoft: '#ecfdf3',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
  chip: '#f1f2f6',
};

export const darkColors: ThemeColors = {
  accent: '#6366f1',
  accentStrong: '#818cf8',
  accentSoft: '#1c1f3a',
  accentBorder: '#33386b',
  accentContrast: '#ffffff',
  bg: '#0a0c11',
  surface: '#12141b',
  surface2: '#191c25',
  panel: '#15171f',
  tile: '#1a1d27',
  tileStrong: '#232734',
  border: '#232733',
  borderStrong: '#2f3442',
  text: '#e9ebf1',
  text2: '#9aa1b2',
  text3: '#6d7488',
  star: '#fbbf24',
  success: '#4ade80',
  successSoft: '#10231a',
  danger: '#f87171',
  dangerSoft: '#2a1517',
  chip: '#1e222d',
};

export const theme = {
  colors: lightColors,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
};

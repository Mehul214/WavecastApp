export interface Theme {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accentPink: string;
  border: string;
  inputBg: string;
  statusBarStyle: 'light-content' | 'dark-content';
}

export const darkTheme: Theme = {
  isDark: true,
  background: '#0B0D13',
  surface: '#0F121C',
  card: '#161924',
  cardBorder: '#242A3D',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  accentPink: '#EC4899',
  border: '#181C28',
  inputBg: '#161924',
  statusBarStyle: 'light-content',
};

export const lightTheme: Theme = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#6366F1',
  primaryLight: '#4F46E5',
  accentPink: '#EC4899',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  statusBarStyle: 'dark-content',
};

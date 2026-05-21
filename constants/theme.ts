// DAVA — Design System: Deep Forest Green + Champagne Gold
export const Colors = {
  // Brand
  primary: '#C9A84C',        // Champagne gold
  primaryLight: '#E8C97C',
  primaryDark: '#A07830',
  primaryMuted: '#C9A84C18',

  // Backgrounds — deep forest green
  bg: '#0D1E16',
  bgCard: '#152A1E',
  bgSurface: '#1C3527',
  bgInput: '#1A2E22',
  bgModal: '#112019',

  // Borders
  border: '#2A4035',
  borderGold: '#C9A84C55',
  divider: '#1E3028',

  // Text
  textPrimary: '#F5EDD8',    // warm cream
  textSecondary: '#B8CDB8',  // muted sage
  textMuted: '#6A8A74',
  textInverse: '#0D1E16',

  // Semantic
  success: '#4CAF82',
  error: '#E05C5C',
  warning: '#E0A550',
  info: '#4AAFCF',

  // Misc
  overlay: 'rgba(0,0,0,0.6)',
  transparent: 'transparent',

  // Tab bar
  tabBg: '#0D1E16',
  tabActive: '#C9A84C',
  tabInactive: '#4A6A54',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
};

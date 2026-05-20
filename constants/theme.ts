// DAVA - Luxury Fashion Store Theme
export const Colors = {
  // Primary Brand
  primary: '#C9A84C',        // Gold
  primaryDark: '#A07830',    // Dark Gold
  primaryLight: '#E8C96A',   // Light Gold
  primaryMuted: 'rgba(201,168,76,0.15)',

  // Backgrounds
  bg: '#0A0A0A',             // Pure Black
  bgCard: '#111111',         // Card Black
  bgCardHover: '#1A1A1A',    // Hover Black
  bgSurface: '#161616',      // Surface
  bgInput: '#1C1C1C',        // Input Background
  bgModal: 'rgba(0,0,0,0.85)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#5A5A5A',
  textGold: '#C9A84C',
  textInverse: '#0A0A0A',

  // UI
  border: '#2A2A2A',
  borderGold: 'rgba(201,168,76,0.4)',
  divider: '#1E1E1E',
  
  // Semantic
  success: '#4CAF82',
  error: '#E05252',
  warning: '#E0A050',
  info: '#5090E0',

  // Overlay
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
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
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
};

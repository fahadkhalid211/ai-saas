export const colors = {
  // Brand Backgrounds
  bgDark: '#04140d',
  bg: '#08251a',
  bgCard: '#0c2e20',
  bgCardHover: '#113b2a',
  bgElevated: '#144632',
  
  // Borders
  border: '#174834',
  borderSubtle: '#0f3826',
  borderFocus: '#abff44',
  
  // Brand Lime & Accents
  accent: '#abff44',       // Crescelo signature electric lime
  accentHover: '#bbfd66',
  accentDark: '#74d321',
  accentGlow: 'rgba(171, 255, 68, 0.15)',
  accentGlowStrong: 'rgba(171, 255, 68, 0.35)',
  
  // Typography
  textPrimary: '#fffeeb',   // Warm cream
  textSecondary: '#94a3b8', // Muted slate
  textMuted: '#64748b',
  textInverse: '#04140d',
  
  // Statuses
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  info: '#38bdf8',
  infoBg: 'rgba(56, 189, 248, 0.15)',
  
  // Lavender accent
  lavender: '#f0d7ff',
};

export const typography = {
  fontFamily: 'System',
  heading1: { fontSize: 26, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  heading2: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary, letterSpacing: -0.3 },
  heading3: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 20 },
  bodySecondary: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textMuted },
  badge: { fontSize: 11, fontWeight: '600' as const },
};

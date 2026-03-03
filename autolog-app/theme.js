import { StyleSheet } from 'react-native';

// Premium Automotive-Tech Color System
export const Colors = {
  // Premium Background System (Deeper, Richer)
  background: '#0A0E1A',        // Deep space background
  surface1: '#111827',          // Card background (glassmorphism base)
  surface2: '#1A2236',          // Elevated cards/modals
  surface3: '#243049',          // Interactive elements hover
  
  // Glass Effect Colors
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassBackground: 'rgba(17, 24, 39, 0.8)',
  
  // Border System
  border: 'rgba(30, 45, 61, 0.4)',
  
  // Accent Colors (Automotive Safety Inspired)
  primary: '#3B82F6',           // Electric blue (CTAs, interactive)
  warning: '#F59E0B',           // Amber/safety yellow (due soon)
  danger: '#EF4444',            // Safety red (overdue)
  success: '#10B981',           // Emerald green (healthy)
  
  // Text Hierarchy
  textPrimary: '#F1F5F9',       // Crisp white
  textSecondary: '#94A3B8',     // Cool gray
  textTertiary: '#64748B',      // Muted
  
  // Legacy Compatibility (will be phased out)
  midnightNavy: '#0A0E1A',
  pearlWhite: '#F1F5F9',
  charcoalGray: '#243049',
  amberAlert: '#F59E0B',
  forestGreen: '#10B981',
  steelBlue: '#3B82F6',
  warmCopper: '#B45309',
  arcticSilver: '#94A3B8',
  deepRed: '#EF4444',
  surface: '#111827',
  elevated: '#1A2236',
  accent: '#3B82F6',
  interactive: '#3B82F6',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',
};

// Premium Typography Hierarchy - ALL text should use these
export const Typography = StyleSheet.create({
  // Hero - Screen titles (32px Bold) - lowercase style
  hero: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    lineHeight: 38,
    color: Colors.textPrimary,
  },
  
  // H1 - Section headers (24px Bold) 
  h1: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  
  // H2 - Card titles, important labels (18px SemiBold)
  h2: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  
  // Body - Main content, descriptions (15px Regular)
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: Colors.textPrimary,
  },
  
  // Caption - Secondary info, metadata (13px Medium)
  caption: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  
  // Small - Fine print (11px Regular)
  small: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textTertiary,
  },
  
  // Legacy aliases (for compatibility)
  display: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    lineHeight: 38,
    color: Colors.textPrimary,
  },
});

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,    // Section spacing (32-48px between major sections)
  sectionLarge: 48,
  horizontal: 20, // Content padding (20-24px horizontal)
  horizontalLarge: 24,
  cardMargin: 16, // 16px between cards
  buttonMargin: 12, // 12px between related buttons
};

// Shared component styles - Premium Glassmorphism Design
export const Shared = StyleSheet.create({
  // Glassmorphism Card - Main card style
  card: {
    backgroundColor: Colors.glassBackground,
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.cardMargin,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // Premium card with enhanced spacing
  cardPrimary: {
    backgroundColor: Colors.glassBackground,
    borderRadius: 20,
    padding: Spacing.horizontalLarge,
    marginBottom: Spacing.cardMargin,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // Elevated card for modals/overlays
  cardElevated: {
    backgroundColor: Colors.surface2,
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.cardMargin,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // Premium Button styles
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.buttonMargin,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.buttonMargin,
  },
  
  buttonDestructive: {
    backgroundColor: Colors.danger,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.buttonMargin,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.horizontal,
  },
  
  containerLarge: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.horizontalLarge,
  },
  
  // Premium form input styles
  input: {
    backgroundColor: Colors.surface1,
    borderRadius: 16,
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: Colors.surface2,
  },
  
  // Health Score Dial Components (View-based, no SVG)
  healthDialContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  healthDialOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: Colors.surface1,
    position: 'absolute',
  },
  
  healthDialInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
  },
});
import React from 'react';
import { Switch } from 'react-native';
import { Colors } from '../theme';

/**
 * One toggle style for the whole app — solid primary track, white thumb.
 *
 * `colors` defaults to the (theme-mutated) Colors so callers using the static
 * import work as-is; Settings passes its useTheme() colors so the toggle tracks
 * light/dark immediately. Replaces the per-call trackColor/thumbColor that left
 * toggles looking different from screen to screen.
 */
export default function AppSwitch({ value, onValueChange, colors = Colors, style }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.glassBorder, true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.glassBorder}
      style={style}
    />
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, LightColors, Shared, applyTheme } from '../theme';

const THEME_KEY = '@autolog_theme_mode';

const ThemeContext = createContext({
  isDark: true,
  colors: Colors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'light') {
        setIsDark(false);
        applyTheme('light');
      }
      setReady(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next ? 'dark' : 'light');
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const colors = isDark ? Colors : LightColors;

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;

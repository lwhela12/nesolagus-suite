import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { useThemeConfig } from './ConfigContext';
import { theme as defaultTheme } from '../styles/theme';

interface DynamicThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider that loads theme from config API
 * Falls back to default theme if config is not loaded yet
 */
export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const themeConfig = useThemeConfig();

  // Merge theme config with default theme
  const mergedTheme = themeConfig
    ? {
        ...defaultTheme,
        ...themeConfig,
        colors: {
          ...defaultTheme.colors,
          ...themeConfig.colors
        },
        fonts: {
          ...defaultTheme.fonts,
          ...themeConfig.fonts
        }
      }
    : defaultTheme;

  return (
    <ThemeProvider theme={mergedTheme}>
      {children}
    </ThemeProvider>
  );
};

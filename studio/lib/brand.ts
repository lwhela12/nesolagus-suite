/**
 * Nesolagus Brand Design Tokens
 *
 * Centralized brand constants for colors, typography, spacing, and design elements.
 * Based on the Nesolagus dashboard design system.
 */

export const nesologusBrand = {
  colors: {
    // Primary brand colors - Green gradient
    primary: {
      from: '#64B37A',  // Brand primary green
      to: '#2F6D49',    // Dark green
      DEFAULT: '#64B37A',
    },

    // Surface and background colors
    surface: {
      light: '#E6F4EA',     // Pale mint green (light mode backgrounds)
      DEFAULT: '#FFFFFF',   // White (cards, panels)
      dark: '#0E2A23',      // Dark teal/green (dark mode)
    },

    // Border colors
    border: {
      DEFAULT: '#CDEBD8',   // Muted green border
      subtle: '#E5E7EB',    // Light gray for subtle borders
    },

    // Text colors
    text: {
      primary: '#0E2A23',   // Dark teal/green for headings
      secondary: '#4B5563', // Gray for body text
      muted: '#6B7280',     // Lighter gray for hints
      inverse: '#FFFFFF',   // White text on dark backgrounds
    },

    // Background colors
    background: {
      DEFAULT: '#F7F7F6',   // Warm cream/off-white
      pure: '#FFFFFF',      // Pure white
      dark: '#0F172A',      // Dark mode background
    },

    // Accent colors for states
    accent: {
      success: '#10B981',   // Green for success states
      warning: '#F59E0B',   // Amber for warnings
      error: '#EF4444',     // Red for errors
      info: '#3B82F6',      // Blue for information
    },
  },

  typography: {
    fonts: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },

    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',  // Fully rounded
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(100, 179, 122, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(100, 179, 122, 0.1), 0 1px 2px 0 rgba(100, 179, 122, 0.06)',
    md: '0 4px 6px -1px rgba(100, 179, 122, 0.1), 0 2px 4px -1px rgba(100, 179, 122, 0.06)',
    lg: '0 10px 15px -3px rgba(100, 179, 122, 0.1), 0 4px 6px -2px rgba(100, 179, 122, 0.05)',
    xl: '0 20px 25px -5px rgba(100, 179, 122, 0.1), 0 10px 10px -5px rgba(100, 179, 122, 0.04)',
    '2xl': '0 25px 50px -12px rgba(100, 179, 122, 0.25)',
    glow: '0 0 20px rgba(100, 179, 122, 0.3)',
    'glow-strong': '0 0 40px rgba(100, 179, 122, 0.6)',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #64B37A 0%, #2F6D49 100%)',
    surface: 'linear-gradient(180deg, #E6F4EA 0%, #FFFFFF 100%)',
    overlay: 'linear-gradient(180deg, rgba(100, 179, 122, 0.1) 0%, transparent 100%)',
  },

  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easings: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

// Export individual sections for convenience
export const colors = nesologusBrand.colors;
export const typography = nesologusBrand.typography;
export const spacing = nesologusBrand.spacing;
export const shadows = nesologusBrand.shadows;
export const gradients = nesologusBrand.gradients;

// Helper functions
export const hexToHSL = (hex: string): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

// Export HSL values for Tailwind CSS variables
export const hslColors = {
  primary: hexToHSL(colors.primary.DEFAULT),
  'primary-foreground': hexToHSL(colors.primary.to),
  secondary: hexToHSL(colors.surface.light),
  accent: hexToHSL(colors.border.DEFAULT),
  background: hexToHSL(colors.background.DEFAULT),
  'text-primary': hexToHSL(colors.text.primary),
};

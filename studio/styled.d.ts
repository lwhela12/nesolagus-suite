import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      surfaceAlt?: string;
      botBubble?: string;
      userBubble?: string;
      border: string;
      text: {
        primary: string;
        secondary?: string;
        inverse?: string;
      };
      error?: string;
      success?: string;
      warning?: string;
    };
    fonts: {
      family: string;
      sizes: {
        xs?: string;
        sm?: string;
        base: string;
        lg?: string;
        xl?: string;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
  }
}

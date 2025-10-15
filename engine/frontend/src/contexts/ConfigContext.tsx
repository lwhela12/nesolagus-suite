import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SurveyConfig {
  survey: {
    id: string;
    name: string;
    description?: string;
    metadata?: {
      estimatedMinutes?: number;
      targetAudience?: string;
      [key: string]: any;
    };
    sections?: Array<{
      id: string;
      name: string;
      blocks: string[];
    }>;
  };
  blocks: {
    [key: string]: any;
  };
}

export interface ThemeConfig {
  metadata: {
    name: string;
    organizationName: string;
    description?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background?: string;
    surface?: string;
    [key: string]: any;
  };
  fonts: {
    primary: string;
    display?: string;
  };
  assets?: {
    logo?: string;
    favicon?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ConfigContextType {
  surveyConfig: SurveyConfig | null;
  themeConfig: ThemeConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [surveyResponse, themeResponse] = await Promise.all([
        axios.get(`${API_URL}/api/config/survey`),
        axios.get(`${API_URL}/api/config/theme`)
      ]);

      if (surveyResponse.data.success) {
        setSurveyConfig(surveyResponse.data.data);
      } else {
        throw new Error('Failed to load survey configuration');
      }

      if (themeResponse.data.success) {
        setThemeConfig(themeResponse.data.data);
      } else {
        throw new Error('Failed to load theme configuration');
      }
    } catch (err: any) {
      console.error('Error loading configs:', err);
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const value: ConfigContextType = {
    surveyConfig,
    themeConfig,
    loading,
    error,
    refetch: fetchConfigs
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to access survey and theme configurations
 */
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

/**
 * Hook to access just the survey config
 */
export const useSurveyConfig = (): SurveyConfig | null => {
  const { surveyConfig } = useConfig();
  return surveyConfig;
};

/**
 * Hook to access just the theme config
 */
export const useThemeConfig = (): ThemeConfig | null => {
  const { themeConfig } = useConfig();
  return themeConfig;
};

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

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
    [key: string]: {
      id: string;
      type: string;
      content?: string;
      next?: string;
      conditionalNext?: any;
      options?: any[];
      variable?: string;
      [key: string]: any;
    };
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

/**
 * Abstract interface for config loading
 * Allows switching between file-based and database-based configs
 */
export interface ConfigLoader {
  getSurvey(): Promise<SurveyConfig>;
  getTheme(): Promise<ThemeConfig>;
}

/**
 * File-based config loader (V1 - Template model)
 * Loads survey and theme from JSON files in the config directory
 *
 * Multi-client support:
 * - Set CLIENT_ID environment variable to load client-specific config
 * - Configs stored in config/clients/{clientId}.json
 * - Falls back to config/clients/default.json if CLIENT_ID not set or config not found
 */
export class FileConfigLoader implements ConfigLoader {
  private configDir: string;
  private surveyCache: Map<string, SurveyConfig> = new Map();
  private themeCache: ThemeConfig | null = null;

  constructor(configDir?: string) {
    // Default to root config directory
    this.configDir = configDir || path.resolve(__dirname, '../../..', 'config');
  }

  async getSurvey(): Promise<SurveyConfig> {
    // Get CLIENT_ID from environment variable (defaults to 'default')
    const clientId = process.env.CLIENT_ID || 'default';

    // Check cache for this client
    if (this.surveyCache.has(clientId)) {
      logger.info(`Loaded survey config from cache for client: ${clientId}`);
      return this.surveyCache.get(clientId)!;
    }

    try {
      // Try to load client-specific config from clients directory
      const clientPath = path.join(this.configDir, 'clients', `${clientId}.json`);

      if (!fs.existsSync(clientPath)) {
        logger.warn(`Config for client '${clientId}' not found at ${clientPath}`);

        // Fall back to default client config
        const defaultPath = path.join(this.configDir, 'clients', 'default.json');

        if (!fs.existsSync(defaultPath)) {
          // Final fallback: try legacy survey.json
          logger.warn('No clients/default.json found, falling back to legacy survey.json');
          const legacyPath = path.join(this.configDir, 'survey.json');

          if (!fs.existsSync(legacyPath)) {
            const examplePath = path.join(this.configDir, 'survey.example.json');

            if (!fs.existsSync(examplePath)) {
              throw new Error('No survey config found. Please create config/clients/default.json');
            }

            const data = fs.readFileSync(examplePath, 'utf-8');
            const config = JSON.parse(data);
            this.surveyCache.set(clientId, config);
            logger.info(`Loaded survey.example.json as fallback for client: ${clientId}`);
            return config;
          }

          const data = fs.readFileSync(legacyPath, 'utf-8');
          const config = JSON.parse(data);
          this.surveyCache.set(clientId, config);
          logger.info(`Loaded legacy survey.json for client: ${clientId}`);
          return config;
        }

        // Load default client config
        const data = fs.readFileSync(defaultPath, 'utf-8');
        const config = JSON.parse(data);
        this.surveyCache.set(clientId, config);
        logger.info(`Loaded default.json for client: ${clientId}`);
        return config;
      }

      // Load client-specific config
      const data = fs.readFileSync(clientPath, 'utf-8');
      const config = JSON.parse(data);
      this.surveyCache.set(clientId, config);
      logger.info(`Loaded survey config for client: ${clientId} (${config.survey.name})`);
      return config;
    } catch (error) {
      logger.error(`Failed to load survey config for client '${clientId}':`, error);
      throw error;
    }
  }

  async getTheme(): Promise<ThemeConfig> {
    if (this.themeCache) {
      return this.themeCache;
    }

    try {
      const themePath = path.join(this.configDir, 'theme.json');

      if (!fs.existsSync(themePath)) {
        logger.warn('theme.json not found, falling back to theme.example.json');
        const examplePath = path.join(this.configDir, 'theme.example.json');

        if (!fs.existsSync(examplePath)) {
          throw new Error('Neither theme.json nor theme.example.json found in config directory');
        }

        const data = fs.readFileSync(examplePath, 'utf-8');
        this.themeCache = JSON.parse(data);
      } else {
        const data = fs.readFileSync(themePath, 'utf-8');
        this.themeCache = JSON.parse(data);
      }

      logger.info(`Loaded theme config: ${this.themeCache.metadata.name}`);
      return this.themeCache;
    } catch (error) {
      logger.error('Failed to load theme config:', error);
      throw error;
    }
  }

  /**
   * Clear caches - useful for hot reloading in development
   * @param clientId - Optional specific client ID to clear. If not provided, clears all caches.
   */
  clearCache(clientId?: string): void {
    if (clientId) {
      this.surveyCache.delete(clientId);
      logger.info(`Config cache cleared for client: ${clientId}`);
    } else {
      this.surveyCache.clear();
      this.themeCache = null;
      logger.info('All config caches cleared');
    }
  }
}

// Singleton instance
let configLoader: ConfigLoader;

/**
 * Get the config loader instance
 * Can be swapped for DatabaseConfigLoader in the future
 */
export function getConfigLoader(): ConfigLoader {
  if (!configLoader) {
    configLoader = new FileConfigLoader();
  }
  return configLoader;
}

/**
 * Set a custom config loader (for testing or switching to DB mode)
 */
export function setConfigLoader(loader: ConfigLoader): void {
  configLoader = loader;
}

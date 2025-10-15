import { Request, Response } from 'express';
import { getConfigLoader } from '../config/configLoader';
import { logger } from '../utils/logger';

/**
 * Controller for serving survey and theme configurations
 */
class ConfigController {
  /**
   * GET /api/config/survey
   * Returns the survey structure configuration
   */
  async getSurvey(_req: Request, res: Response) {
    try {
      const configLoader = getConfigLoader();
      const survey = await configLoader.getSurvey();

      res.json({
        success: true,
        data: survey
      });
    } catch (error: any) {
      logger.error('Error loading survey config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load survey configuration',
        message: error.message
      });
    }
  }

  /**
   * GET /api/config/theme
   * Returns the theme/branding configuration
   */
  async getTheme(_req: Request, res: Response) {
    try {
      const configLoader = getConfigLoader();
      const theme = await configLoader.getTheme();

      res.json({
        success: true,
        data: theme
      });
    } catch (error: any) {
      logger.error('Error loading theme config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load theme configuration',
        message: error.message
      });
    }
  }

  /**
   * GET /api/config/metadata
   * Returns combined metadata from both configs
   */
  async getMetadata(_req: Request, res: Response) {
    try {
      const configLoader = getConfigLoader();
      const [survey, theme] = await Promise.all([
        configLoader.getSurvey(),
        configLoader.getTheme()
      ]);

      res.json({
        success: true,
        data: {
          surveyName: survey.survey.name,
          surveyDescription: survey.survey.description,
          organizationName: theme.metadata.organizationName,
          estimatedMinutes: survey.survey.metadata?.estimatedMinutes,
          logo: theme.assets?.logo,
          favicon: theme.assets?.favicon
        }
      });
    } catch (error: any) {
      logger.error('Error loading metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load metadata',
        message: error.message
      });
    }
  }
}

export const configController = new ConfigController();

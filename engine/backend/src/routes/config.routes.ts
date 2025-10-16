import { Router } from 'express';
import { configController } from '../controllers/config.controller';

const router = Router();

// Get survey structure configuration
router.get('/survey', configController.getSurvey);

// Get theme/branding configuration
router.get('/theme', configController.getTheme);

// Get dashboard configuration
router.get('/dashboard', configController.getDashboard);

// Get combined metadata
router.get('/metadata', configController.getMetadata);

export default router;

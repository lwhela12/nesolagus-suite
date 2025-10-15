import { Router } from 'express';
import { previewController } from '../controllers/preview.controller';

const router = Router();

/**
 * Preview Routes
 * These endpoints allow studio to preview surveys with custom configs
 * without database persistence
 */

// Start a preview session with custom config
router.post(
  '/start',
  previewController.startPreview.bind(previewController)
);

// Submit an answer in preview mode
router.post(
  '/answer',
  previewController.submitAnswer.bind(previewController)
);

// Clear a preview session
router.delete(
  '/session/:sessionId',
  previewController.clearSession.bind(previewController)
);

export default router;

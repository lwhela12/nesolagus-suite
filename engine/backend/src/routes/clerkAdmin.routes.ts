import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireClerkAuth } from '../middleware/clerkAuth';

const router = Router();

// All routes require Clerk authentication
router.use(requireClerkAuth);

// Response management
router.get('/responses', adminController.getResponses);
router.get('/responses/:responseId', adminController.getResponseDetail);
router.get('/export', adminController.exportResponses);
router.patch('/responses/:responseId/test', adminController.markResponseTest);
router.delete('/responses/:responseId', adminController.deleteResponse);
router.delete('/responses', adminController.deleteResponses);

// Analytics
router.get('/analytics/summary', adminController.getAnalyticsSummary);
router.get('/analytics/questions', adminController.getQuestionStats);

export default router;

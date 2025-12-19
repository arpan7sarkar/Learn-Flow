import express from 'express';
import { generateStudyPlan, getStudyCalendar, updateCalendarEvent, clearCalendar, getAllStudyPlans, getStudyAnalytics, deleteStudyPlan } from '../controllers/plannerController.js';

const router = express.Router();

// Generate study plan
router.post('/generate-study-plan', generateStudyPlan);

// Get study calendar
router.get('/study-calendar', getStudyCalendar);

// Update calendar event
router.patch('/calendar-event/:id', updateCalendarEvent);

// Get study plan details
router.get('/study-plan/:id', (await import('../controllers/plannerController.js')).getStudyPlan);

// Clear calendar (for testing/reset)
router.delete('/clear-calendar', clearCalendar);

// Get all study plans (History)
router.get('/all-study-plans', getAllStudyPlans);

// Get study analytics
router.get('/study-analytics', getStudyAnalytics);

// Delete study plan
router.delete('/study-plan/:id', deleteStudyPlan);

export default router;

import express from 'express';
import { explainTopic, createQuiz, submitQuiz, getQuizHistory } from '../controllers/tutorController.js';

const router = express.Router();

// Get AI explanation for topic
router.post('/ai-explain-topic', explainTopic);

// Generate quiz
router.post('/generate-quiz', createQuiz);

// Submit quiz answers
router.post('/submit-quiz', submitQuiz);

// Get quiz history
router.get('/quiz-history', getQuizHistory);

// Get chat history
// Get chat history (sessions list)
router.get('/chat-history', (await import('../controllers/tutorController.js')).getChatHistory);

// Get specific chat session
router.get('/chat-session/:sessionId', (await import('../controllers/tutorController.js')).getChatSession);

// Delete chat session
router.delete('/chat-session/:sessionId', (await import('../controllers/tutorController.js')).deleteChatSession);

export default router;

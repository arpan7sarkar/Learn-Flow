import { explainTopicWithAnalogy } from '../services/geminiServices/tutor.js';
import { generateQuiz } from '../services/geminiServices/quiz.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

/**
 * Get AI explanation for a topic
 * POST /api/ai-explain-topic
 */
import ChatHistory from '../models/ChatHistory.js';

export const explainTopic = async (req, res) => {
  try {
    await connectDB();
    const { topic, analogy = 'reallife', userId, sessionId } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Get user by email from request
    const userEmail = req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({ email: userEmail, name: userEmail.split('@')[0] });
    }

    // Get or create chat session
    let chat;
    if (sessionId) {
      chat = await ChatHistory.findOne({ _id: sessionId, userId: user._id });
    }

    // Create new session if no ID provided or session not found
    if (!chat) {
      chat = await ChatHistory.create({
        userId: user._id,
        topic: topic,
        messages: []
      });
    }

    const userMessage = `Explain ${topic} using ${analogy} analogy`;
    chat.messages.push({ role: 'user', content: userMessage });

    const explanation = await explainTopicWithAnalogy(topic, analogy);

    // AI Response Content construction
    const aiContent = `${explanation.simpleExplanation}\n\n${explanation.analogyExplanation}`;

    // Save message WITH keyPoints for persistence
    chat.messages.push({
      role: 'model',
      content: aiContent,
      keyPoints: explanation.keyPoints || []
    });

    chat.lastUpdated = Date.now();
    await chat.save();

    res.json({
      success: true,
      data: {
        sessionId: chat._id,
        topic,
        analogy,
        ...explanation
      }
    });
  } catch (error) {
    console.error('Explain topic error:', error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Generate quiz for a topic
 * POST /api/generate-quiz
 */
export const createQuiz = async (req, res) => {
  try {
    const { topic, numQuestions = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const quiz = await generateQuiz(topic, numQuestions);

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit quiz answers
 * POST /api/submit-quiz
 */
export const submitQuiz = async (req, res) => {
  try {
    await connectDB();
    const { topic, answers, userId } = req.body;

    if (!topic || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Topic and answers are required' });
    }

    // Get user by email from request
    const userEmail = req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Calculate score
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / answers.length) * 100);

    // Save quiz result
    const quizResult = await QuizResult.create({
      userId: user._id,
      topic,
      score,
      totalQuestions: answers.length,
      answers
    });

    res.json({
      success: true,
      data: {
        quizResultId: quizResult._id,
        score,
        correctAnswers,
        totalQuestions: answers.length,
        passed: score >= 70
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get quiz history
 * GET /api/quiz-history
 */
export const getQuizHistory = async (req, res) => {
  try {
    await connectDB();
    const userEmail = req.query.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.json({ success: true, data: [] });
    }

    const quizzes = await QuizResult.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get chat history
 * GET /api/chat-history
 */
export const getChatHistory = async (req, res) => {
  try {
    await connectDB();
    const userEmail = req.query.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.json({ success: true, data: [] });
    }

    // Return list of sessions (id, topic, date) for sidebar
    const chatSessions = await ChatHistory.find({ userId: user._id })
      .sort({ lastUpdated: -1 })
      .select('_id topic lastUpdated');

    res.json({
      success: true,
      data: chatSessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get specific chat session
 * GET /api/chat-session/:sessionId
 */
export const getChatSession = async (req, res) => {
  try {
    await connectDB();
    const { sessionId } = req.params;
    const userEmail = req.query.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const chat = await ChatHistory.findOne({ _id: sessionId, userId: user._id });

    res.json({
      success: true,
      data: chat ? chat.messages : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete chat session
 * DELETE /api/chat-session/:sessionId
 */
export const deleteChatSession = async (req, res) => {
  try {
    await connectDB();
    const { sessionId } = req.params;
    const userEmail = req.query.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const result = await ChatHistory.deleteOne({ _id: sessionId, userId: user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { explainTopic, createQuiz, submitQuiz, getQuizHistory, getChatHistory, getChatSession, deleteChatSession };

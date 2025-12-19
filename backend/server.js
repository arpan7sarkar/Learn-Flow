import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import syllabusRoutes from './routes/syllabusRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// CORS Configuration - Permissive for debugging
app.use(cors({
  origin: true, // Allow all origins for now (set to specific URLs after debugging)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// Connect to MongoDB
// For Vercel, we need to await this, but top-level await is only supported in modules.
// Since we are using "type": "module", we can try top-level await or just call it.
// Better to let the first request trigger connection reuse or connect immediately if possible.
connectDB().catch(err => console.error(err));

// API Routes
app.use('/api', syllabusRoutes);
app.use('/api', plannerRoutes);
app.use('/api', tutorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Learn-Flow API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Learn-Flow Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      uploadSyllabus: 'POST /api/upload-syllabus',
      generatePlan: 'POST /api/generate-study-plan',
      getCalendar: 'GET /api/study-calendar',
      explainTopic: 'POST /api/ai-explain-topic',
      generateQuiz: 'POST /api/generate-quiz',
      submitQuiz: 'POST /api/submit-quiz'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
// Start server only if not running in Vercel (or similar serverless) environment
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || 'Production') {
  app.listen(PORT, () => {
    console.log(`🚀 Learn-Flow Backend running on port ${PORT}`);
    console.log(`📚 API available at http://localhost:${PORT}`);
  });
}

export default app;

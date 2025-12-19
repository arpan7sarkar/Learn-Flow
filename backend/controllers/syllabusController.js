import fs from 'fs';
import { parsePDF, extractTopicsFromText, extractExamDate } from '../services/pdfParser.js';
import StudyPlan from '../models/StudyPlan.js';
import User from '../models/User.js';

/**
 * Upload and process syllabus PDF
 * POST /api/upload-syllabus
 */
export const uploadSyllabus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Parse PDF
    const text = await parsePDF(filePath);
    
    // Extract subjects and topics
    const subjects = extractTopicsFromText(text);
    
    // Extract exam date
    const examDate = extractExamDate(text);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Get or create user based on email from request
    const userEmail = req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        email: userEmail,
        name: userEmail.split('@')[0] // Use part before @ as default name
      });
    }

    // Create study plan
    const studyPlan = await StudyPlan.create({
      userId: user._id,
      title: req.body.title || 'My Study Plan',
      subjects,
      examDate,
      syllabusText: text.substring(0, 5000) // Store first 5000 chars
    });

    // Update user's study plans
    user.studyPlans.push(studyPlan._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Syllabus processed successfully',
      data: {
        studyPlanId: studyPlan._id,
        subjects: subjects.map(s => ({
          name: s.name,
          topicCount: s.topics.length
        })),
        examDate,
        totalTopics: subjects.reduce((sum, s) => sum + s.topics.length, 0)
      }
    });
  } catch (error) {
    console.error('Upload syllabus error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get study plan details
 * GET /api/study-plan/:id
 */
export const getStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id);
    
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json({
      success: true,
      data: studyPlan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { uploadSyllabus, getStudyPlan };

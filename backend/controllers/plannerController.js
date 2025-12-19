import StudyPlan from '../models/StudyPlan.js';
import CalendarEvent from '../models/CalendarEvent.js';
import { generateStudyPlanWithAI } from '../services/geminiServices/planner.js';
import { createCalendarEvents, getCalendarEvents, updateEventCompletion } from '../services/plannerEngine.js';

/**
 * Generate study plan from existing study plan data
 * POST /api/generate-study-plan
 */
export const generateStudyPlan = async (req, res) => {
  try {
    const { studyPlanId, hoursPerDay = 4, examDate } = req.body;

    const studyPlan = await StudyPlan.findById(studyPlanId);
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    // Override exam date if provided by user
    if (examDate) {
      studyPlan.examDate = new Date(examDate);
    }

    // Delete old calendar events for this study plan
    await CalendarEvent.deleteMany({ studyPlanId: studyPlan._id });

    // Generate AI-powered schedule
    const plan = await generateStudyPlanWithAI(
      studyPlan.subjects,
      studyPlan.examDate,
      hoursPerDay
    );

    // Create calendar events
    const events = await createCalendarEvents(plan, studyPlan.userId, studyPlan._id);

    // Update study plan with hours per day and AI metadata
    studyPlan.hoursPerDay = hoursPerDay;
    studyPlan.tips = plan.tips;
    studyPlan.estimatedReadiness = plan.estimatedReadiness;
    await studyPlan.save();

    res.json({
      success: true,
      message: 'Study plan generated successfully',
      data: {
        studyPlanId: studyPlan._id,
        schedule: plan.schedule,
        tips: plan.tips,
        estimatedReadiness: plan.estimatedReadiness,
        eventsCreated: events.length
      }
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get study plan details
 * GET /api/study-plan/:id
 */
export const getStudyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const studyPlan = await StudyPlan.findById(id);

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

/**
 * Get study calendar events
 * GET /api/study-calendar
 */
export const getStudyCalendar = async (req, res) => {
  try {
    const { studyPlanId, startDate, endDate } = req.query;

    let events = [];

    if (studyPlanId) {
      // Get events for specific study plan
      const query = { studyPlanId };
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      events = await CalendarEvent.find(query).sort({ date: 1, startTime: 1 });
    } else {
      // Get events for user by email
      const userEmail = req.query.userEmail;
      if (userEmail) {
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ email: userEmail });

        if (user) {
          // Get the most recent study plan for this user
          const latestPlan = await StudyPlan.findOne({ userId: user._id })
            .sort({ createdAt: -1 });

          if (latestPlan) {
            events = await CalendarEvent.find({ studyPlanId: latestPlan._id })
              .sort({ date: 1, startTime: 1 });
          }
        }
      }
    }

    // Format for react-big-calendar - filter out invalid events
    const formattedEvents = events
      .filter(event => event.date && event.startTime && event.endTime && event.topic)
      .map(event => {
        const dateStr = event.date.toISOString().split('T')[0];
        const startTime = event.startTime || '09:00';
        const endTime = event.endTime || '10:00';

        // Parse date parts for local time construction
        const [year, month, day] = dateStr.split('-').map(Number);
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        return {
          id: event._id,
          title: event.title || 'Study Session',
          start: { year, month: month - 1, day, hour: startHour, minute: startMin },
          end: { year, month: month - 1, day, hour: endHour, minute: endMin },
          type: event.type,
          topic: event.topic,
          completed: event.completed,
          description: event.description
        };
      });

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update event completion status
 * PATCH /api/calendar-event/:id
 */
export const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const event = await updateEventCompletion(id, completed);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear all calendar events for user (for testing)
 * DELETE /api/clear-calendar
 */
export const clearCalendar = async (req, res) => {
  try {
    const userEmail = req.query.userEmail || req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ email: userEmail });

    if (user) {
      await CalendarEvent.deleteMany({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Calendar cleared'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all study plans for a user (History)
 * GET /api/all-study-plans
 */
export const getAllStudyPlans = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const userEmail = req.query.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.json({ success: true, count: 0, data: [] });
    }
    
    const userId = user._id;

    const plans = await StudyPlan.find({ userId })
      .select('title subjects examDate createdAt hoursPerDay estimatedReadiness startDate')
      .sort({ createdAt: -1 });

    // Get completion stats for each plan
    const formattedPlans = await Promise.all(plans.map(async (p) => {
      // Get calendar events for this plan
      const events = await CalendarEvent.find({ studyPlanId: p._id });
      const totalSessions = events.length;
      const completedSessions = events.filter(e => e.completed).length;
      const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      // Calculate days until exam
      const daysUntilExam = p.examDate 
        ? Math.ceil((new Date(p.examDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        _id: p._id,
        title: p.title,
        examDate: p.examDate,
        createdAt: p.createdAt,
        subjectCount: p.subjects?.length || 0,
        topicCount: p.subjects?.reduce((acc, s) => acc + (s.topics?.length || 0), 0) || 0,
        readiness: p.estimatedReadiness || 0,
        totalSessions,
        completedSessions,
        completionRate,
        daysUntilExam,
        status: daysUntilExam !== null && daysUntilExam < 0 ? 'completed' : 
                completionRate === 100 ? 'completed' : 
                totalSessions > 0 ? 'in_progress' : 'not_started'
      };
    }));

    res.json({
      success: true,
      count: formattedPlans.length,
      data: formattedPlans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get study analytics with AI insights
 * GET /api/study-analytics
 */
export const getStudyAnalytics = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const userEmail = req.query.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      // Return empty stats for new users
      return res.json({ success: true, data: { stats: { totalSessions: 0, completedSessions: 0, completionRate: 0, totalHours: 0, currentStreak: 0, topicDistribution: {} }, analysis: null } });
    }
    
    const userId = user._id;

    // Get all calendar events
    const events = await CalendarEvent.find({ userId });

    // Get latest study plan for context (subjects)
    const latestPlan = await StudyPlan.findOne({ userId }).sort({ createdAt: -1 });
    const subjects = latestPlan ? latestPlan.subjects : [];

    // 1. Calculate Statistics
    const totalSessions = events.length;
    const completedSessions = events.filter(e => e.completed).length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Approx hours (assuming 1 hour per session if not specified, or diff)
    // For simplicity, we'll assume 1 hour per session event for now
    const totalHours = completedSessions;

    // Topic Distribution
    const topicDistribution = {};
    events.forEach(e => {
      if (e.topic) {
        topicDistribution[e.topic] = (topicDistribution[e.topic] || 0) + 1;
      }
    });

    // Calculate Streak
    // Sort completed events by date
    const completedEvents = events
      .filter(e => e.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    if (completedEvents.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if studied today
      const lastStudyDate = new Date(completedEvents[completedEvents.length - 1].date);
      lastStudyDate.setHours(0, 0, 0, 0);

      const diffDays = (today.getTime() - lastStudyDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays <= 1) {
        currentStreak = 1;
        // Walk backwards
        for (let i = completedEvents.length - 2; i >= 0; i--) {
          const curr = new Date(completedEvents[i].date);
          const prev = new Date(completedEvents[i + 1].date);
          curr.setHours(0, 0, 0, 0);
          prev.setHours(0, 0, 0, 0);

          const gap = (prev.getTime() - curr.getTime()) / (1000 * 3600 * 24);
          if (gap === 1) {
            currentStreak++;
          } else if (gap === 0) {
            // Same day, continue
            continue;
          } else {
            break;
          }
        }
      }
    }

    const stats = {
      totalSessions,
      completedSessions,
      completionRate,
      totalHours,
      currentStreak,
      topicDistribution
    };

    // 2. Generate AI Analysis
    const { analyzeStudyProgress } = await import('../services/geminiServices/analysis.js');
    const aiAnalysis = await analyzeStudyProgress(stats, subjects);

    res.json({
      success: true,
      data: {
        stats,
        analysis: aiAnalysis
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export default { generateStudyPlan, getStudyCalendar, updateCalendarEvent, clearCalendar, getStudyPlan, getAllStudyPlans, getStudyAnalytics };

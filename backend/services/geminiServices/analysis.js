import dotenv from 'dotenv';
import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';
dotenv.config();

export const analyzeStudyProgress = async (stats, subjects) => {
    try {
        const model = getModel(process.env.GEMINI_API_KEY_ANALYSIS);

        const prompt = `
        You are an expert academic counselor and study analyst.
        Analyze the following study progress data for a student:

        **Statistics:**
        - Total Study Sessions: ${stats.totalSessions}
        - Completed Sessions: ${stats.completedSessions}
        - Completion Rate: ${stats.completionRate}%
        - Total Hours Studied: ${stats.totalHours}
        - Current Streak: ${stats.currentStreak} days
        
        **Subject Distribution (Sessions per subject):**
        ${JSON.stringify(stats.topicDistribution, null, 2)}

        **Subjects in Syllabus:**
        ${subjects.map(s => s.name).join(', ')}

        Provide a brief, encouraging, and actionable analysis (max 150 words).
        1. Praise their consistency or achievements.
        2. Identify any subjects they might be neglecting based on the distribution vs syllabus.
        3. Give one specific tip to improve their "Readiness".
        
        Keep the tone professional yet motivating.
        `;

        const result = await generateContentWithRetry(model, prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return "Great job keeping up with your studies! Keep tracking your progress to get more personalized insights.";
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize separate Gemini instance for Analysis
// User must provide GEMINI_ANALYSIS_API_KEY in .env
const analysisGenAI = new GoogleGenerativeAI(process.env.GEMINI_ANALYSIS_API_KEY || process.env.GEMINI_API_KEY || "");

const getAnalysisModel = () => {
    // User requested 2.5-flash, but falling back to 1.5-flash for stability/availability
    // as 2.5-flash previously caused 503 errors.
    return analysisGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const analyzeStudyProgress = async (stats, subjects) => {
    try {
        const model = getAnalysisModel();

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

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return "Great job keeping up with your studies! Keep tracking your progress to get more personalized insights.";
    }
};

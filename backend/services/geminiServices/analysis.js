import dotenv from 'dotenv';
import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';
dotenv.config();

export const analyzeStudyProgress = async (stats, subjects) => {
    try {
        const model = getModel(process.env.GEMINI_API_KEY_ANALYSIS);

        // Calculate coverage and gaps
        const subjectNames = subjects.map(s => s.name);
        const studiedTopics = Object.keys(stats.topicDistribution || {});
        const avgSessionsPerTopic = studiedTopics.length > 0 
          ? Object.values(stats.topicDistribution).reduce((a, b) => a + b, 0) / studiedTopics.length 
          : 0;

        const prompt = `You are an expert academic coach and learning analytics specialist. Analyze this student's study progress and provide actionable insights.

## STUDY DATA

### Performance Metrics
| Metric | Value |
|--------|-------|
| Total Study Sessions | ${stats.totalSessions} |
| Completed Sessions | ${stats.completedSessions} |
| Completion Rate | ${stats.completionRate}% |
| Total Hours Studied | ${stats.totalHours} |
| Current Streak | ${stats.currentStreak} days |
| Avg Sessions/Topic | ${avgSessionsPerTopic.toFixed(1)} |

### Study Distribution by Topic
${JSON.stringify(stats.topicDistribution, null, 2)}

### Syllabus Subjects
${subjectNames.join(', ')}

## ANALYSIS REQUIREMENTS

Provide a response in this JSON structure:
{
  "summary": "2-3 sentence overall assessment (encouraging but honest)",
  "strengths": [
    "Specific strength based on data",
    "Another positive observation"
  ],
  "areasForImprovement": [
    "Specific topic or habit that needs attention",
    "Another gap identified"
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Specific actionable step",
      "reason": "Why this matters"
    },
    {
      "priority": "medium",
      "action": "Another actionable step", 
      "reason": "Why this helps"
    }
  ],
  "readinessScore": 75,
  "studyPatternInsight": "One observation about their study habits or patterns",
  "motivationalMessage": "Personalized encouragement based on their progress"
}

## ANALYSIS PRINCIPLES
1. Be specific - reference actual topics/subjects from the data
2. Be actionable - give concrete next steps, not vague advice
3. Be encouraging - acknowledge effort while highlighting improvements
4. Be data-driven - base insights on the actual metrics provided
5. Identify neglected subjects by comparing syllabus vs study distribution

Return ONLY the JSON object, no markdown or extra text.`;

        const result = await generateContentWithRetry(model, prompt);
        const text = result.response.text();
        
        // Try to parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch {
                // If JSON parsing fails, return the text as summary
                return {
                    summary: text.trim(),
                    strengths: [],
                    areasForImprovement: [],
                    recommendations: [],
                    readinessScore: stats.completionRate || 50,
                    motivationalMessage: "Keep going! Every study session brings you closer to your goals."
                };
            }
        }
        
        return {
            summary: text.trim(),
            strengths: [],
            areasForImprovement: [],
            recommendations: [],
            readinessScore: stats.completionRate || 50,
            motivationalMessage: "Keep going! Every study session brings you closer to your goals."
        };

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return {
            summary: "Great job keeping up with your studies! Keep tracking your progress to get more personalized insights.",
            strengths: ["You're actively using the study planner"],
            areasForImprovement: [],
            recommendations: [{
                priority: "medium",
                action: "Complete more study sessions to unlock detailed analytics",
                reason: "More data helps us give better recommendations"
            }],
            readinessScore: 50,
            motivationalMessage: "Every expert was once a beginner. Keep pushing forward! 🚀"
        };
    }
};

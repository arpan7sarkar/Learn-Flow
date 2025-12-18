import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';

/**
 * Generate study plan using AI
 * @param {Array} subjects - Array of subjects with topics
 * @param {Date} examDate - Target exam date
 * @param {number} hoursPerDay - Available study hours per day
 * @returns {Promise<Object>} - AI-optimized study plan
 */



/**
 * Generate study plan using AI
 * @param {Array} subjects - Array of subjects with topics
 * @param {Date} examDate - Target exam date
 * @param {number} hoursPerDay - Available study hours per day
 * @returns {Promise<Object>} - AI-optimized study plan
 */
export const generateStudyPlanWithAI = async (
  subjects,
  examDate,
  hoursPerDay = 4
) => {
  const model = getModel();

  const prompt = `You are a study planner AI. Create an optimized study schedule.

SUBJECTS AND TOPICS:
${JSON.stringify(subjects, null, 2)}

EXAM DATE: ${examDate}
HOURS PER DAY: ${hoursPerDay}
TODAY: ${new Date().toISOString().split("T")[0]}

Create a JSON response with this structure:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "topic": "topic name",
          "subject": "subject name",
          "duration": 2,
          "type": "study|review",
          "priority": "high|medium|low"
        }
      ]
    }
  ],
  "tips": ["study tip 1", "study tip 2"],
  "estimatedReadiness": 85
}

Rules:
1. Distribute topics evenly to prevent burnout
2. Include review sessions for difficult topics
3. Leave buffer time before exam
4. Harder topics get more time
5. Response must be valid JSON only`;

  try {
    const result = await generateContentWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("Gemini study plan error:", error);
    // Fallback to basic plan generation
    return generateBasicPlan(subjects, examDate, hoursPerDay);
  }
};

/**
 * Fallback basic plan generation
 */
const generateBasicPlan = (subjects, examDate, hoursPerDay) => {
  const schedule = [];
  const today = new Date();
  const exam = new Date(examDate);
  const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

  let bufferDays = 2;
  if (daysUntilExam <= 2) bufferDays = 0;
  else if (daysUntilExam <= 5) bufferDays = 1;

  const studyDays = Math.max(daysUntilExam - bufferDays, 1);

  let allTopics = [];
  subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      const topicObj = topic.toObject ? topic.toObject() : topic;
      allTopics.push({ ...topicObj, subject: subject.name });
    });
  });

  const topicsPerDay = Math.ceil(
    allTopics.length / studyDays
  );
  let topicIndex = 0;

  for (
    let day = 0;
    day < studyDays && topicIndex < allTopics.length;
    day++
  ) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    const sessions = [];
    for (let i = 0; i < topicsPerDay && topicIndex < allTopics.length; i++) {
      const topic = allTopics[topicIndex++];
      sessions.push({
        topic: topic.name,
        subject: topic.subject,
        duration: Math.min(topic.estimatedHours, hoursPerDay / topicsPerDay),
        type: "study",
        priority: "medium",
      });
    }

    schedule.push({
      date: date.toISOString().split("T")[0],
      sessions,
    });
  }

  return {
    schedule,
    tips: [
      "Take short breaks every 25-30 minutes",
      "Review difficult topics multiple times",
      "Get enough sleep before the exam",
    ],
    estimatedReadiness: 75,
  };
};

export default { generateStudyPlanWithAI };

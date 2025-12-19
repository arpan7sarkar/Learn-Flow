import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';


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
  const model = getModel(process.env.GEMINI_API_KEY_PLAN);
  
  const today = new Date();
  const exam = new Date(examDate);
  const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  
  // Calculate total topics and estimated hours
  let totalTopics = 0;
  let totalEstimatedHours = 0;
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      totalTopics++;
      totalEstimatedHours += topic.estimatedHours || 2;
    });
  });

  const prompt = `You are an expert AI study planner specialized in creating personalized, science-backed study schedules. Your goal is to maximize learning retention and exam readiness.

## STUDENT CONTEXT
- **Subjects & Topics:** ${JSON.stringify(subjects, null, 2)}
- **Exam Date:** ${examDate} (${daysUntilExam} days from today)
- **Available Study Hours Per Day:** ${hoursPerDay} hours
- **Today's Date:** ${today.toISOString().split("T")[0]}
- **Total Topics:** ${totalTopics}
- **Total Estimated Study Hours Needed:** ${totalEstimatedHours}

## SCHEDULING PRINCIPLES (Apply These)

### 1. Spaced Repetition
- Schedule review sessions 1, 3, and 7 days after initial learning
- Harder topics need more review cycles
- Topics with higher weightage should appear more frequently

### 2. Cognitive Load Management  
- Start each day with moderately difficult material (warm-up)
- Place most challenging topics in the middle of study sessions (peak focus)
- End with lighter review or easier topics (cool-down)
- Limit consecutive hours on same subject to 2 hours max

### 3. Interleaving Practice
- Mix different subjects within the same day when possible
- Alternate between conceptual and problem-solving topics
- Avoid back-to-back sessions on highly similar topics

### 4. Strategic Time Allocation
- High weightage topics get 50% more time
- Difficult topics (estimatedHours >= 3) get priority slots
- Reserve final 2-3 days before exam for comprehensive review only

### 5. Session Structure (Pomodoro-based)
- Each session should be 25-50 minutes of focused study
- Sessions close together form a single "duration" block
- Include implicit break time in duration estimates

## OUTPUT FORMAT
Return ONLY valid JSON with this exact structure:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "topic": "Exact topic name from input",
          "subject": "Subject name",
          "duration": 1.5,
          "type": "study|review|practice|revision",
          "priority": "high|medium|low",
          "startTime": "09:00",
          "endTime": "10:30",
          "description": "Brief learning objective for this session"
        }
      ]
    }
  ],
  "tips": [
    "Personalized tip based on the specific subjects",
    "Study technique relevant to these topics",
    "Motivation or focus tip",
    "Pre-exam preparation tip"
  ],
  "estimatedReadiness": 85,
  "planSummary": {
    "totalStudyHours": 40,
    "avgHoursPerDay": 4,
    "reviewSessions": 15,
    "focusAreas": ["topic1", "topic2"]
  }
}

## CRITICAL RULES
1. NEVER exceed ${hoursPerDay} hours of study per day
2. ALWAYS include at least 2 review/revision sessions for each topic
3. Start times should begin at 09:00 and respect day boundaries
4. Sessions should have realistic gaps (30 min breaks between 2-hour blocks)
5. Final 1-2 days should be ONLY revision type sessions
6. estimatedReadiness should be 0-100 based on time available vs needed
7. Response must be ONLY the JSON object, no markdown, no explanation

Generate the optimal study plan now:`;

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

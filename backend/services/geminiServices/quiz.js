import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';

/**
 * Generate quiz for a topic
 * @param {string} topic - Topic for quiz
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Object>} - Quiz questions
 */
export const generateQuiz = async (topic, numQuestions = 5) => {
  const model = getModel();

  const prompt = `Create a quiz for testing knowledge on: ${topic}

Generate ${numQuestions} multiple choice questions in this JSON format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
1. Questions should test understanding, not just memorization
2. Include some application-based questions
3. All 4 options should be plausible
4. Response must be valid JSON only
5. IMPORTANT: Wrap ALL mathematical formulas in dollar signs ($) for LaTeX rendering (e.g., use "$\\\\frac{1}{2}$", not "\\frac{1}{2}" or "1/2").
6. IMPORTANT: You MUST double-escape all backslashes (e.g., use "$\\\\psi$" instead of "$\\psi$").`;

  try {
    const result = await generateContentWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("Gemini quiz error:", error);
    return {
      topic,
      questions: [
        {
          id: 1,
          question: `What is the main concept of ${topic}?`,
          options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          correctAnswer: "A",
          explanation: "This is a placeholder question.",
        },
      ],
    };
  }
};

export default { generateQuiz };

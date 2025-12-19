import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';

/**
 * Generate quiz for a topic
 * @param {string} topic - Topic for quiz
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Object>} - Quiz questions
 */
export const generateQuiz = async (topic, numQuestions = 5) => {
  const model = getModel(process.env.GEMINI_API_KEY_QUIZ);

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
5. FORMATTING RULES:
   - Use standard **Markdown** for text formatting (bold, italics, code blocks).
   - Use **LaTeX** for ALL mathematical expressions, wrapped in single dollar signs ($).
   - Example directly in string: "The density is $\\\\rho = \\\\frac{m}{V}$".
   - IMPORTANT: You MUST double-escape all backslashes in the JSON string (e.g., use "\\\\frac" for fraction).
   - Do NOT use plain text for math (no "x^2", use "$x^2$").`;

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
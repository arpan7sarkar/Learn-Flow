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

  const prompt = `You are an expert educational assessment designer. Create a high-quality quiz that effectively tests understanding of the given topic.

## TOPIC
"${topic}"

## QUIZ REQUIREMENTS
- **Total Questions:** ${numQuestions}
- **Question Distribution (Bloom's Taxonomy):**
  - 30% Remember/Understand (basic recall, definitions)
  - 40% Apply/Analyze (problem-solving, connections)
  - 30% Evaluate/Create (critical thinking, synthesis)

## QUESTION DESIGN PRINCIPLES

### 1. Variety of Question Types
- Conceptual understanding questions
- Application-based scenarios
- "Which of the following is FALSE" questions
- Cause-and-effect relationship questions
- Multi-step reasoning questions

### 2. Quality Distractors
- All wrong options should be plausible
- Avoid "none of the above" or "all of the above"
- Wrong options should reflect common misconceptions
- Similar complexity across all options

### 3. Progressive Difficulty
- Start with easier questions to build confidence
- Increase difficulty gradually
- End with challenging but fair questions

## OUTPUT FORMAT
Return ONLY valid JSON with this exact structure:
{
  "topic": "${topic}",
  "difficulty": "intermediate",
  "questions": [
    {
      "id": 1,
      "question": "Clear, unambiguous question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "bloomLevel": "understand|apply|analyze|evaluate",
      "difficulty": "easy|medium|hard"
    }
  ],
  "passingScore": 70,
  "estimatedTime": "${numQuestions * 2} minutes"
}

## CRITICAL RULES
1. Questions must test genuine understanding, NOT just memorization
2. Each question must have exactly 4 options (A, B, C, D)
3. correctAnswer must be ONLY the letter (A, B, C, or D)
4. Response must be ONLY valid JSON - no markdown, no extra text
5. IMPORTANT: Wrap ALL math formulas in dollar signs ($) for LaTeX (e.g., "$\\\\frac{1}{2}$")
6. IMPORTANT: Double-escape all backslashes in LaTeX

Generate the quiz now:`;

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

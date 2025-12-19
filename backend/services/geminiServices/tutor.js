import { getModel } from './model.js';
import { generateContentWithRetry } from './utils.js';

/**
 * Explain topic with analogy
 * @param {string} topic - Topic to explain
 * @param {string} analogy - Analogy style (marvel, cricket, etc.)
 * @returns {Promise<Object>} - Explanation with analogy
 */



export const explainTopicWithAnalogy = async (topic, analogy = "reallife") => {
  const model = getModel(process.env.GEMINI_API_KEY_TUTOR);

  const analogyContexts = {
    marvel: "Use Marvel Cinematic Universe characters, powers, and storylines",
    cricket: "Use cricket concepts, players, matches, and strategies",
    football: "Use football/soccer concepts, teams, players, and tactics",
    movies: "Use popular movie plots, characters, and scenes",
    reallife: "Use everyday real-life situations and examples",
  };

  const prompt = `You are an expert tutor who explains complex topics using fun analogies.

TOPIC: ${topic}
ANALOGY STYLE: ${analogyContexts[analogy] || (analogy === 'Custom' ? "Use a creative and relevant analogy that fits the topic well" : analogyContexts.reallife)}

IMPORTANT: Keep the explanation concise and focused. Do not be overly verbose.

Provide a response in this JSON format:
{
  "simpleExplanation": "A clear, concise explanation for beginners (2-3 sentences max)",
  "analogyExplanation": "The explanation using the requested analogy (keep it focused, max 3 paragraphs)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "relatedTopics": ["topic 1", "topic 2"]
}

Make it engaging, memorable, and educational.

Rules for formatting:
1. Response must be valid JSON only
2. IMPORTANT: Wrap ALL mathematical formulas in dollar signs ($) for LaTeX rendering (e.g., use "$\\\\frac{1}{2}$", not "\\frac{1}{2}" or "1/2").
3. IMPORTANT: You MUST double-escape all backslashes (e.g., use "$\\\\psi$" instead of "$\\psi$").`;

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
    console.error("Gemini explain error:", error);
    return {
      simpleExplanation: `${topic} is an important concept in this subject area.`,
      analogyExplanation: `Let me explain ${topic} using a simple analogy...`,
      keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
      commonMistakes: ["Common mistake 1"],
      relatedTopics: ["Related topic 1"],
    };
  }
};

export default { explainTopicWithAnalogy };
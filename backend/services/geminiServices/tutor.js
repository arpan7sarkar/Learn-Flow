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
    marvel: "Use Marvel Cinematic Universe - Iron Man's suits for technology, Thanos's snap for probability, Dr. Strange's multiverse for parallel concepts, Avengers teamwork for system components",
    cricket: "Use cricket strategy - batting techniques for step-by-step processes, bowling variations for different approaches, field placement for optimization, innings for phases, run chases for goal-oriented problems",
    football: "Use football/soccer tactics - formations for structures, passing plays for data flow, defense strategies for error handling, match analysis for problem decomposition, team coordination for parallel processes",
    movies: "Use blockbuster films - Inception layers for recursion, Matrix simulation for virtual concepts, Interstellar time dilation for relativity, Avengers assembly for modular design",
    reallife: "Use everyday scenarios - cooking recipes for algorithms, traffic flow for networks, banking for transactions, social media for graphs, shopping for optimization",
    scifi: "Use science fiction - Star Trek's warp drive for speed concepts, AI robots for automation, space colonization for expansion, time travel for state management"
  };

  const prompt = `You are a world-class tutor who transforms complex topics into memorable, engaging explanations using creative analogies. Your teaching style combines the Socratic method with storytelling.

## TOPIC TO EXPLAIN
"${topic}"

## ANALOGY STYLE
${analogyContexts[analogy] || (analogy === 'Custom' ? "Create a highly creative, unexpected but fitting analogy that makes the concept unforgettable" : analogyContexts.reallife)}

## TEACHING PRINCIPLES (Apply These)

### 1. Progressive Complexity
- Start with the simplest core concept
- Build up to advanced nuances layer by layer
- End with the "aha moment" connection

### 2. Memory Anchoring
- Create vivid mental images
- Use emotional connections (humor, surprise, wonder)
- Relate to things the student already knows

### 3. Practical Application
- Show real-world use cases
- Explain why this matters
- Connect to career or exam relevance

## OUTPUT FORMAT
Provide a response in this exact JSON structure:
{
  "simpleExplanation": "Crystal-clear 2-sentence explanation that a 12-year-old could understand",
  "analogyExplanation": "Rich, engaging narrative using the requested analogy (3-4 paragraphs). Make it feel like a story that teaches. Include specific characters or scenarios from the analogy domain.",
  "keyPoints": [
    "Key insight 1 - the foundational concept",
    "Key insight 2 - how it works",
    "Key insight 3 - why it matters",
    "Key insight 4 - common application"
  ],
  "commonMistakes": [
    "Mistake 1: What beginners often confuse and why",
    "Mistake 2: A subtle error that even experienced learners make"
  ],
  "relatedTopics": ["Topic that builds on this", "Topic that contrasts with this", "Prerequisites to revisit"],
  "examTips": "One powerful tip for tackling this topic in exams",
  "visualSuggestion": "Description of a diagram or visual that would help understand this concept"
}

## CRITICAL RULES
1. Response must be ONLY valid JSON - no markdown, no extra text
2. IMPORTANT: Wrap ALL mathematical formulas in dollar signs ($) for LaTeX (e.g., "$\\\\frac{1}{2}$")
3. IMPORTANT: Double-escape all backslashes ("$\\\\psi$" not "$\\psi$")
4. Make the analogy explanation genuinely entertaining and memorable
5. Avoid generic statements - be specific and insightful`;

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

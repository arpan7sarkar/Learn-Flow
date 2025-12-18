/**
 * Helper to generate content with retry logic for 503 errors and overloaded states.
 * Consistent implementation across all Gemini services.
 */
export const generateContentWithRetry = async (model, prompt, retries = 3) => {
    let lastError = null;

    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            lastError = error;
            const isOverloaded =
                error.status === 503 ||
                (error.statusText && error.statusText.includes('Overloaded')) ||
                error.message.includes('503') ||
                error.message.includes('overloaded');

            if (isOverloaded && i < retries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, i) * 1000;
                console.log(`Gemini overloaded. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // If it's not an overload error, or we're out of retries, throw it
            throw error;
        }
    }

    // This part should theoretically not be reached if throw error is inside catch,
    // but let's make it robust against any loop escape.
    throw lastError || new Error(`Gemini generation failed after ${retries} attempts`);
};

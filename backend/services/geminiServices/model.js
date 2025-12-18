import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Get Gemini model instance
 */
export const getModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

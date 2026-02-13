
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const generateQuestions = async (count: number = 9): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} TOEFL Writing "Build a Sentence" tasks. 
    The level must be for US undergraduate students (academic discussions, campus life, internship interviews, complex social interactions).
    
    Format:
    - Context: A question or statement from Person A.
    - Template: A response from Person B containing several blanks (_____).
    - ScrambledWords: 5-7 words that fit into the blanks.
    - CorrectSentence: The full, grammatically correct response of Person B.
    - Distractor: ONE extra word that is grammatically or semantically plausible but NOT used in the correct sentence.

    Example structure:
    Context: "What did the professor say about the upcoming mid-term evaluation?"
    Template: "He mentioned that _____ _____ _____ _____ _____ _____ _____ criteria."
    ScrambledWords: ["students", "should", "focus", "on", "the", "grading", "new"]
    Distractor: "study"
    
    Ensure the vocabulary is sophisticated (e.g., 'prerequisite', 'syllabus', 'internship', 'extracurricular', 'perspective', 'comprehensive').
    Return a JSON array of objects with keys: id, context, template, scrambledWords, correctSentence, distractor.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            context: { type: Type.STRING },
            template: { type: Type.STRING },
            scrambledWords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctSentence: { type: Type.STRING },
            distractor: { type: Type.STRING }
          },
          required: ["id", "context", "template", "scrambledWords", "correctSentence", "distractor"]
        }
      }
    }
  });

  try {
    const raw = response.text;
    const data = JSON.parse(raw);
    return data.map((q: any, index: number) => ({
        ...q,
        id: `q-${index}`
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

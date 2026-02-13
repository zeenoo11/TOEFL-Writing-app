
import { Question } from "../types";

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch("/questions.csv");
    if (!response.ok) {
      throw new Error("Failed to fetch questions CSV");
    }
    const text = await response.text();
    // Handle different newline formats
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

    // Skip header
    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split("|");
      if (values.length < 6) {
          console.warn(`Skipping malformed line ${i}: ${line}`);
          continue;
      }

      const id = values[0];
      const context = values[1];
      const template = values[2];
      let scrambledWords: string[] = [];
      try {
        scrambledWords = JSON.parse(values[3]);
      } catch (e) {
        console.error(`Failed to parse scrambledWords at line ${i}`, values[3]);
        scrambledWords = [];
      }
      const correctSentence = values[4];
      const distractor = values[5].trim();

      questions.push({
        id,
        context,
        template,
        scrambledWords,
        correctSentence,
        distractor
      });
    }

    return questions;
  } catch (error) {
    console.error("Error loading questions:", error);
    return [];
  }
};

export const getRandomQuestions = async (count: number): Promise<Question[]> => {
    const allQuestions = await fetchQuestions();
    if (allQuestions.length === 0) {
        throw new Error("No questions available. Please ensure public/questions.csv exists and is populated.");
    }

    // Fisher-Yates shuffle
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
};

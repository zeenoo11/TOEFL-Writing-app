
export interface Question {
  id: string;
  context: string;
  template: string; // e.g., "_____ _____ _____ _____ ______ _____ you a _____?"
  scrambledWords: string[]; // Includes 1 distractor
  correctSentence: string;
  distractor: string;
}

export interface SessionResult {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  answers: {
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
}

export enum AppState {
  LOBBY,
  LOADING,
  QUIZ,
  RESULT
}

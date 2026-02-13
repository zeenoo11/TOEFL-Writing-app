import { Question, Difficulty } from "../types";

/**
 * 개별 질문 데이터의 유효성을 검증합니다.
 */
const validateQuestion = (q: Question, index: number): string | null => {
  if (!q.id || !q.context || !q.correctSentence) {
    return `Line ${index}: Missing essential fields (id, context, or correctSentence).`;
  }

  // 템플릿, 스크램블 단어, 난이도 기본 값 검증
  if (
    !q.template ||
    !Array.isArray(q.scrambledWords) ||
    q.scrambledWords.length === 0 ||
    !q.difficulty
  ) {
    return `Line ${index} [ID: ${q.id}]: Missing or invalid template, scrambledWords, or difficulty.`;
  }
  // 템플릿 빈칸 개수 계산
  const blankCount = (q.template.match(/_{3,}/g) || []).length;
  const wordCount = q.scrambledWords.length;

  if (blankCount !== wordCount) {
    return `Line ${index} [ID: ${q.id}]: Template has ${blankCount} blanks, but scrambledWords has ${wordCount} words.`;
  }

  const validDifficulties: Difficulty[] = ['Middle School', 'High School', 'University'];
  if (!validDifficulties.includes(q.difficulty)) {
    return `Line ${index} [ID: ${q.id}]: Invalid difficulty '${q.difficulty}'.`;
  }

  if (q.correctSentence.includes(q.distractor)) {
    // 주의: 방해 단어가 정답 문장 내에 부분 문자열로 존재할 수는 있으나, 
    // 여기서는 독립된 단어로 포함되어 혼란을 주는지 여부를 체크할 수 있습니다.
    // (현재는 단순 로그만 남기거나 필요시 에러 처리)
  }

  return null;
};

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    // Vercel 배포 시 public 폴더의 경로는 루트(/) 기준입니다.
    const response = await fetch("/questions.csv", {
        cache: 'no-store' // 데이터 업데이트 반영을 위해 캐시 방지 옵션 추가
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch questions.csv: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    
    const questions: Question[] = [];
    const idSet = new Set<string>();

    // 헤더 제외하고 반복 (i=1부터)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split("|");

      if (values.length < 7) {
        console.error(`[Data Error] Line ${i + 1} has insufficient fields: ${line}`);
        continue;
      }

      try {
        const rawScrambled = values[3].trim();
        const question: Question = {
          id: values[0].trim(),
          context: values[1].trim(),
          template: values[2].trim(),
          scrambledWords: JSON.parse(rawScrambled),
          correctSentence: values[4].trim(),
          distractor: values[5].trim(),
          difficulty: values[6].trim() as Difficulty
        };

        // 중복 ID 체크
        if (idSet.has(question.id)) {
          console.error(`[Data Error] Duplicate ID found: ${question.id}`);
          continue;
        }

        // 데이터 유효성 검증
        const error = validateQuestion(question, i + 1);
        if (error) {
          console.error(`[Validation Error] ${error}`);
          continue;
        }

        idSet.add(question.id);
        questions.push(question);
      } catch (e) {
        console.error(`[Parsing Error] Failed to parse line ${i + 1}:`, e);
      }
    }

    if (questions.length === 0) {
      throw new Error("No valid questions found after parsing.");
    }

    console.log(`Successfully loaded and validated ${questions.length} questions.`);
    return questions;
  } catch (error) {
    console.error("Critical error in questionService:", error);
    throw error;
  }
};

export const getRandomQuestions = async (count: number, difficulty: Difficulty): Promise<Question[]> => {
    const allQuestions = await fetchQuestions();
    const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);

    if (filteredQuestions.length === 0) {
        throw new Error(`No valid questions available for difficulty: ${difficulty}`);
    }

    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

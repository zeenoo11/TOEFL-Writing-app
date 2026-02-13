
import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'public', 'questions.csv');

console.log('--- Starting Data Validation ---');

if (!fs.existsSync(csvPath)) {
  console.error('Error: questions.csv not found in public folder!');
  process.exit(1);
}

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/?
/).filter(line => line.trim() !== "");
const headers = lines[0].split('|');

let errorCount = 0;

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split('|');
  const lineNum = i + 1;

  if (values.length !== 7) {
    console.error(`Row ${lineNum}: Expected 7 columns, but found ${values.length}`);
    errorCount++;
    continue;
  }

  const [id, context, template, scrambled, correct, distractor, difficulty] = values;

  // 1. JSON 형식 검증
  try {
    const words = JSON.parse(scrambled);
    // 2. 빈칸 개수 검증
    const blankCount = (template.match(/_{3,}/g) || []).length;
    if (blankCount !== words.length) {
      console.error(`Row ${lineNum} [ID: ${id}]: Template has ${blankCount} blanks, but scrambledWords has ${words.length} words.`);
      errorCount++;
    }
  } catch (e) {
    console.error(`Row ${lineNum} [ID: ${id}]: Failed to parse scrambledWords JSON.`);
    errorCount++;
  }

  // 3. 난이도 오타 검증
  const validDiffs = ['Middle School', 'High School', 'University'];
  if (!validDiffs.includes(difficulty.trim())) {
    console.error(`Row ${lineNum} [ID: ${id}]: Invalid difficulty '${difficulty}'`);
    errorCount++;
  }
}

if (errorCount > 0) {
  console.error(`--- Validation Failed: ${errorCount} errors found ---`);
  process.exit(1); // 빌드 실패 유도
} else {
  console.log('--- Validation Passed: All data is correct! ---');
  process.exit(0);
}

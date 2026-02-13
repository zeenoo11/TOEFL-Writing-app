
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface SentenceBuilderProps {
  question: Question;
  onComplete: (userSentence: string) => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ question, onComplete }) => {
  const [parts, setParts] = useState<(string | null)[]>([]);
  const [placedWords, setPlacedWords] = useState<Record<number, string>>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle the scrambled words + distractor
    const shuffled = [...question.scrambledWords, question.distractor].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords({});

    // Parse template. e.g. "_____ _____ I'm _____"
    const tokens = question.template.split(/(_{3,})/g);
    const parsed = tokens.map(token => {
      if (/_{3,}/.test(token)) return null;
      return token;
    });
    setParts(parsed);
  }, [question]);

  const handleWordClick = (word: string) => {
    let firstEmptyBlankIndex = -1;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === null && !placedWords[i]) {
        firstEmptyBlankIndex = i;
        break;
      }
    }

    if (firstEmptyBlankIndex !== -1) {
      setPlacedWords({ ...placedWords, [firstEmptyBlankIndex]: word });
      const wordIdx = availableWords.indexOf(word);
      if (wordIdx !== -1) {
        const newAvailable = [...availableWords];
        newAvailable.splice(wordIdx, 1);
        setAvailableWords(newAvailable);
      }
    }
  };

  const handleBlankClick = (blankIndex: number) => {
    const wordToRemove = placedWords[blankIndex];
    if (wordToRemove) {
      const newPlaced = { ...placedWords };
      delete newPlaced[blankIndex];
      setPlacedWords(newPlaced);
      setAvailableWords([...availableWords, wordToRemove]);
    }
  };

  const isComplete = parts.filter(p => p === null).length === Object.keys(placedWords).length;

  const handleSubmit = () => {
    const finalSentence = parts.map((part, idx) => {
      if (part === null) return placedWords[idx] || "";
      return part;
    }).join("").replace(/\s+/g, ' ').trim();
    onComplete(finalSentence);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dialogue Area */}
      <div className="space-y-4">
        {/* Person A: Question/Statement */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-slate-500">A</div>
          <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-md border border-slate-100 flex-1">
            <p className="text-lg text-slate-800 font-medium leading-relaxed italic">
              "{question.context}"
            </p>
          </div>
        </div>

        {/* Person B: Builder */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-white shadow-lg">B</div>
          <div className="bg-slate-100 p-6 rounded-2xl rounded-tl-none border-2 border-dashed border-slate-300 flex-1">
            <div className="flex flex-wrap items-center gap-y-4 text-xl">
              {parts.map((part, idx) => {
                if (part === null) {
                  const placed = placedWords[idx];
                  return (
                    <button
                      key={`blank-${idx}`}
                      onClick={() => handleBlankClick(idx)}
                      className={`min-w-[80px] h-10 mx-1 border-b-2 transition-all flex items-center justify-center px-2 ${
                        placed 
                        ? 'border-blue-500 text-blue-700 bg-blue-50/50 rounded-t-md font-semibold' 
                        : 'border-slate-400 hover:border-slate-600 bg-white/30 cursor-default'
                      }`}
                    >
                      {placed || ""}
                    </button>
                  );
                }
                return <span key={`text-${idx}`} className="text-slate-700 whitespace-pre">{part}</span>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Word Bank */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Available Words (Includes 1 Distractor)</h3>
          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">Undergraduate Level</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, idx) => (
            <button
              key={`word-${idx}`}
              onClick={() => handleWordClick(word)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95 font-medium text-slate-700 text-lg"
            >
              {word}
            </button>
          ))}
          {availableWords.length === 0 && (
            <p className="text-slate-400 text-sm italic py-2 px-1">All words used. One word may remain as a distractor if you haven't filled all blanks.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`px-10 py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${
            isComplete 
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Submit Answer <i className="fa-solid fa-paper-plane ml-2"></i>
        </button>
      </div>
    </div>
  );
};

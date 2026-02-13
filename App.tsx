
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Question, SessionResult } from './types';
import { generateQuestions } from './services/geminiService';
import { Timer } from './components/Timer';
import { SentenceBuilder } from './components/SentenceBuilder';

const TOTAL_QUESTIONS = 9;
const SESSION_TIME = 360; // 6 minutes

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOBBY);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult['answers']>([]);
  const [loadingMessage, setLoadingMessage] = useState("Preparing your TOEFL session...");

  const startQuiz = async () => {
    setAppState(AppState.LOADING);
    setLoadingMessage("AI is curating US undergraduate level dialogues...");
    try {
      const newQuestions = await generateQuestions(TOTAL_QUESTIONS);
      setQuestions(newQuestions);
      setCurrentIndex(0);
      setResults([]);
      setAppState(AppState.QUIZ);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
      setAppState(AppState.LOBBY);
    }
  };

  const handleTimeUp = useCallback(() => {
    setAppState(AppState.RESULT);
  }, []);

  const handleQuestionComplete = (userAnswer: string) => {
    const currentQ = questions[currentIndex];
    
    // Normalizing strings for comparison
    const clean = (s: string) => s.replace(/[.?!,]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    const isCorrect = clean(userAnswer) === clean(currentQ.correctSentence);

    setResults(prev => [...prev, {
      questionId: currentQ.id,
      isCorrect,
      userAnswer,
      correctAnswer: currentQ.correctSentence
    }]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setAppState(AppState.RESULT);
    }
  };

  if (appState === AppState.LOBBY) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-white">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
            <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">TOEFL Writing:<br/><span className="text-blue-600">Advanced Build a Sentence</span></h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Master the new TOEFL Writing task with dialogues designed for <span className="font-bold text-blue-700">US Undergraduate level</span> proficiency. 
            Construct sophisticated academic and professional responses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <i className="fa-solid fa-comments text-blue-500"></i>
              <span className="text-sm font-semibold text-slate-700">Q&A Dialogue Format</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <i className="fa-solid fa-shuffle text-purple-500"></i>
              <span className="text-sm font-semibold text-slate-700">Randomized Word Bank</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <i className="fa-solid fa-skull-crossbones text-red-500"></i>
              <span className="text-sm font-semibold text-slate-700">1 Hidden Distractor</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <i className="fa-solid fa-bolt text-amber-500"></i>
              <span className="text-sm font-semibold text-slate-700">6 Minute Time Limit</span>
            </div>
          </div>

          <button 
            onClick={startQuiz}
            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xl font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center group"
          >
            Launch Practice Session <i className="fa-solid fa-rocket ml-3 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
        <p className="mt-8 text-slate-400 text-xs uppercase tracking-widest font-bold">ETS Specification Compliant • US Academic Level</p>
      </div>
    );
  }

  if (appState === AppState.LOADING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-book-open-reader text-blue-600 text-xl animate-bounce"></i>
          </div>
        </div>
        <p className="mt-6 text-slate-600 font-bold text-lg tracking-wide animate-pulse uppercase">{loadingMessage}</p>
      </div>
    );
  }

  if (appState === AppState.QUIZ) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded uppercase tracking-tighter hidden sm:block">TOEFL Prep</div>
              <div className="text-[10px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded uppercase tracking-tighter sm:hidden">TOEFL</div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">EXAM {currentIndex + 1} <span className="text-slate-300">/</span> {questions.length}</div>
            </div>
            <Timer initialSeconds={SESSION_TIME} onTimeUp={handleTimeUp} isActive={true} />
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
          <SentenceBuilder 
            key={questions[currentIndex].id}
            question={questions[currentIndex]} 
            onComplete={handleQuestionComplete} 
          />
        </main>

        <footer className="p-4 flex justify-center">
          <div className="flex space-x-1">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-8 h-1.5 rounded-full transition-all ${
                  i < currentIndex ? 'bg-blue-600' : i === currentIndex ? 'bg-blue-400 w-12' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </footer>
      </div>
    );
  }

  if (appState === AppState.RESULT) {
    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-slate-100">
            <div className={`p-12 text-center text-white ${percentage >= 80 ? 'bg-blue-600' : percentage >= 50 ? 'bg-indigo-700' : 'bg-slate-800'}`}>
              <i className={`fa-solid ${percentage >= 80 ? 'fa-trophy' : 'fa-graduation-cap'} text-5xl mb-6 text-white/40`}></i>
              <div className="text-7xl font-black mb-2">{score}<span className="text-3xl text-white/50">/{TOTAL_QUESTIONS}</span></div>
              <div className="text-xl opacity-90 font-bold uppercase tracking-widest mb-6">Final Evaluation</div>
              <div className="inline-flex items-center space-x-3 bg-black/20 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                <i className="fa-solid fa-bolt text-amber-400"></i>
                <span className="font-black text-xl">PROFICIENCY: {percentage}%</span>
              </div>
            </div>

            <div className="p-8 md:p-12 bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
                <i className="fa-solid fa-magnifying-glass-chart mr-3 text-blue-600"></i>
                Detailed Question Review
              </h3>
              <div className="space-y-8">
                {results.map((res, idx) => (
                  <div key={idx} className={`bg-white p-8 rounded-3xl shadow-sm border-l-8 ${res.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${res.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800">Campus Dialogue {idx + 1}</h4>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${res.isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {res.isCorrect ? 'Perfect' : 'Review Required'}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">A's Input (Context)</div>
                          <p className="text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">"{questions[idx].context}"</p>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Distractor Avoided?</div>
                          <p className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                             Forbidden Word: <span className="underline">{questions[idx].distractor}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {!res.isCorrect && (
                          <div>
                            <div className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-2">Your Output</div>
                            <p className="text-red-700 font-medium p-4 bg-red-50 rounded-xl border border-red-100">{res.userAnswer}</p>
                          </div>
                        )}
                        <div>
                          <div className={`text-[10px] uppercase font-black tracking-widest mb-2 ${res.isCorrect ? 'text-green-500' : 'text-slate-400'}`}>Standard Correct Answer</div>
                          <p className="text-slate-900 font-bold text-lg p-4 bg-white rounded-xl border border-slate-200">{res.correctAnswer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <button 
              onClick={startQuiz}
              className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center hover:-translate-y-1"
            >
              Start New Session <i className="fa-solid fa-play ml-3"></i>
            </button>
            <button 
              onClick={() => setAppState(AppState.LOBBY)}
              className="px-10 py-5 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-black text-xl shadow-md hover:bg-slate-50 transition-all"
            >
              Quit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;

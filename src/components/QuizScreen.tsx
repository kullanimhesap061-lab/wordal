import React, { useState, useEffect, useRef } from 'react';
import { Volume2, AlertCircle, Award, Zap, Timer, Check, X, LogOut, ChevronRight } from 'lucide-react';
import { Question, GameSettings, PlayerResult } from '../types/quiz';
import { sound } from '../utils/sound';

interface QuizScreenProps {
  settings: GameSettings;
  questions: Question[];
  isFallback: boolean;
  onEndGame: () => void;
  onFinish: (result: PlayerResult) => void;
}

const KAHOOT_THEMES = [
  {
    letter: 'A',
    symbol: '▲',
    bg: 'bg-[#e21b3c]',
    shadow: 'border-[#9c0e25] shadow-[#9c0e25]',
    active: 'active:bg-[#c01431]',
  },
  {
    letter: 'B',
    symbol: '◆',
    bg: 'bg-[#1368ce]',
    shadow: 'border-[#094186] shadow-[#094186]',
    active: 'active:bg-[#0f54a8]',
  },
  {
    letter: 'C',
    symbol: '●',
    bg: 'bg-[#ffa602]',
    shadow: 'border-[#b36e00] shadow-[#b36e00]',
    active: 'active:bg-[#d98c00]',
  },
  {
    letter: 'D',
    symbol: '■',
    bg: 'bg-[#26890c]',
    shadow: 'border-[#155506] shadow-[#155506]',
    active: 'active:bg-[#1f6f0a]',
  },
];

const QUESTION_TIME_LIMIT = 20; // 20 seconds per question

export const QuizScreen: React.FC<QuizScreenProps> = ({
  settings,
  questions,
  isFallback,
  onEndGame,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex] || questions[0];

  // Automatically pronounce question if desired
  useEffect(() => {
    // Reset state for new question
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(QUESTION_TIME_LIMIT);

    // Speak question prompt automatically if user is learning
    if (currentQ?.question) {
      sound.speak(currentQ.question);
    }

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
    };
  }, [currentIndex]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedOption(-1); // Timeout
    setWrongCount((w) => w + 1);
    setStreak(0);
    sound.playWrong();

    scheduleNextQuestion();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.answer;

    if (isCorrect) {
      // 100 base points + up to 50 speed points + streak multiplier
      const speedBonus = Math.round((timeLeft / QUESTION_TIME_LIMIT) * 50);
      const streakBonus = Math.min(streak * 20, 100);
      const gained = 100 + speedBonus + streakBonus;

      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      setStreak((st) => st + 1);
      sound.playCorrect();
    } else {
      setWrongCount((w) => w + 1);
      setStreak(0);
      sound.playWrong();
    }

    scheduleNextQuestion();
  };

  const scheduleNextQuestion = () => {
    if (autoNextRef.current) clearTimeout(autoNextRef.current);
    autoNextRef.current = setTimeout(() => {
      advanceQuestion();
    }, 2200);
  };

  const advanceQuestion = () => {
    if (autoNextRef.current) clearTimeout(autoNextRef.current);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed!
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const totalQ = questions.length;
      const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      onFinish({
        score,
        totalQuestions: totalQ,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        accuracy,
        timeSpentSeconds: totalTime,
        category: settings.category,
        level: settings.level,
        topic: settings.topic,
        date: new Date().toLocaleDateString(),
      });
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timePercent = (timeLeft / QUESTION_TIME_LIMIT) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-80px)] justify-between">
      {/* Fallback Notice Banner */}
      {isFallback && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Using verified offline questions for optimal reliability.</span>
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider bg-amber-500/30 px-2 py-0.5 rounded">
            Offline Mode
          </span>
        </div>
      )}

      {/* Top Header: Progress, Scores, End Game */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-fun text-lg sm:text-xl font-extrabold text-white">
              Question {currentIndex + 1}
            </span>
            <span className="text-purple-300 text-sm font-semibold">
              / {questions.length}
            </span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-900/80 border border-purple-700/60 text-purple-200">
              {settings.level}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Score pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="font-fun text-sm sm:text-base font-extrabold">
                {score}
              </span>
            </div>

            {/* Streak */}
            {streak > 1 && (
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-300 animate-pulse">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="font-fun text-xs font-bold">{streak}x Streak!</span>
              </div>
            )}

            {/* End Game Button (Required: no back button during quiz, but End Game button) */}
            <button
              onClick={() => {
                sound.playClick();
                setShowExitModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Game</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-purple-950/80 rounded-full overflow-hidden p-0.5 border border-purple-800/40">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time limit bar */}
        <div className="flex items-center gap-2">
          <div className="w-full h-1.5 bg-purple-950/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-300 shrink-0">
            <Timer className="w-3.5 h-3.5 text-purple-400" />
            <span className={timeLeft <= 5 ? 'text-rose-400 font-extrabold animate-pulse' : ''}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="my-auto py-4">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2d1257] to-[#1c0838] border-2 border-purple-600/40 shadow-2xl text-center space-y-4">
          {/* Question Text & Pronunciation */}
          <div className="flex items-center justify-center gap-3">
            <h1 className="font-fun text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide leading-relaxed">
              {currentQ.question}
            </h1>
            <button
              onClick={() => sound.speak(currentQ.question)}
              className="p-2.5 rounded-full bg-purple-800/80 hover:bg-purple-700 text-yellow-300 transition-colors shadow-md shrink-0 cursor-pointer"
              title="Pronounce question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Clue (Flags, Landmarks, Picture It) */}
          {currentQ.imageUrl && (
            <div className="max-w-md mx-auto">
              {currentQ.imageUrl.includes('flagcdn') ? (
                <div className="relative inline-block p-3 sm:p-4 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-yellow-400/60 shadow-2xl">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-purple-950 shadow-md">
                    🏳️ Identify the Flag
                  </div>
                  <img
                    src={currentQ.imageUrl}
                    alt="National Flag"
                    className="h-32 sm:h-44 w-auto max-w-[280px] sm:max-w-[340px] rounded-xl object-contain shadow-lg border border-black/20 mx-auto transform hover:scale-105 transition-transform"
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border-2 border-purple-500/40 shadow-xl bg-purple-950/60">
                  <img
                    src={currentQ.imageUrl}
                    alt="Question visual clue"
                    className="w-full h-44 sm:h-60 object-cover object-center transform hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                </div>
              )}
            </div>
          )}

          {/* Explanation reveal if answered */}
          {isAnswered && currentQ.explanation && (
            <div className="p-3.5 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-sm animate-fadeIn">
              <span className="font-bold text-yellow-300">Tip: </span>
              {currentQ.explanation}
            </div>
          )}
        </div>
      </div>

      {/* 4 Answers Kahoot-Style Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {currentQ.options.map((option, idx) => {
            const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = idx === currentQ.answer;

            let buttonStateClasses = `${theme.bg} ${theme.shadow} text-white`;

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Correct highlight
                buttonStateClasses = 'bg-emerald-600 border-b-4 border-emerald-800 shadow-emerald-900 text-white ring-4 ring-emerald-300';
              } else if (isSelected && !isCorrectAnswer) {
                // Chosen wrong answer
                buttonStateClasses = 'bg-rose-700 border-b-4 border-rose-950 opacity-60 text-white line-through';
              } else {
                // Other options fade out
                buttonStateClasses = 'bg-purple-950/60 border-b-4 border-purple-900 text-purple-400 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`relative group p-4 sm:p-5 rounded-2xl border-b-[6px] text-left cursor-pointer transition-all duration-150 flex items-center justify-between shadow-lg disabled:cursor-default ${buttonStateClasses} ${
                  !isAnswered ? 'hover:-translate-y-1 active:translate-y-1' : ''
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                    <span className="font-fun text-lg sm:text-xl font-extrabold text-white">
                      {theme.symbol}
                    </span>
                  </div>
                  <span className="font-fun text-base sm:text-xl font-bold tracking-wide break-words">
                    {option}
                  </span>
                </div>

                {/* Status indicator on answer */}
                {isAnswered && (
                  <div className="shrink-0">
                    {isCorrectAnswer ? (
                      <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-white text-rose-600 flex items-center justify-center shadow">
                        <X className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Manual Next Question Button when answered */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={advanceQuestion}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-base shadow-lg shadow-yellow-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#210940] border-2 border-purple-600/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="font-fun text-2xl font-bold text-white">End Game?</h3>
            <p className="text-purple-300 text-sm">
              Your current progress and points will not be saved if you leave now.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-sm cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  onEndGame();
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Volume2, RotateCcw, Delete, Check, Sparkles, Award, LogOut, ChevronRight } from 'lucide-react';
import { WordBuildItem, PlayerResult } from '../types/quiz';
import { sound } from '../utils/sound';

interface WordBuildScreenProps {
  items: WordBuildItem[];
  onEndGame: () => void;
  onFinish: (result: PlayerResult) => void;
}

export const WordBuildScreen: React.FC<WordBuildScreenProps> = ({
  items,
  onEndGame,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetterIndices, setSelectedLetterIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [startTime] = useState(Date.now());

  const currentItem = items[currentIndex] || items[0];
  const targetWord = currentItem.word.toUpperCase();
  const scrambledList = currentItem.scrambled;

  const currentConstructedWord = selectedLetterIndices
    .map((idx) => scrambledList[idx])
    .join('');

  const handleTileClick = (letterIdx: number) => {
    if (isSolved) return;
    if (selectedLetterIndices.includes(letterIdx)) return;

    sound.playClick();
    const newSelected = [...selectedLetterIndices, letterIdx];
    setSelectedLetterIndices(newSelected);

    // If assembled word has same length as target word
    if (newSelected.length === targetWord.length) {
      const assembled = newSelected.map((i) => scrambledList[i]).join('');
      if (assembled === targetWord) {
        // Correct!
        sound.playCorrect();
        setIsSolved(true);
        setScore((s) => s + 150);
        setCorrectCount((c) => c + 1);
        sound.speak(targetWord);
      } else {
        // Wrong!
        sound.playWrong();
        setWrongCount((w) => w + 1);
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 600);
      }
    }
  };

  const handleBackspace = () => {
    if (isSolved || selectedLetterIndices.length === 0) return;
    sound.playClick();
    setSelectedLetterIndices((prev) => prev.slice(0, prev.length - 1));
  };

  const handleReset = () => {
    if (isSolved) return;
    sound.playClick();
    setSelectedLetterIndices([]);
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedLetterIndices([]);
      setIsSolved(false);
    } else {
      // Completed!
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const totalQ = items.length;
      const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      onFinish({
        score,
        totalQuestions: totalQ,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        accuracy,
        timeSpentSeconds: totalTime,
        category: 'word-build',
        level: currentItem.level,
        topic: currentItem.topic,
        date: new Date().toLocaleDateString(),
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-80px)] justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-fun text-xl font-extrabold text-white">
            Word {currentIndex + 1}
          </span>
          <span className="text-purple-300 text-sm font-semibold">/ {items.length}</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {currentItem.level}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="font-fun text-sm sm:text-base font-extrabold">{score}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowExitModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Game</span>
          </button>
        </div>
      </div>

      {/* Center Puzzle Area */}
      <div className="my-auto py-6 space-y-6 text-center">
        {/* Hint Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/80 to-purple-900/60 border border-purple-700/60 shadow-xl max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLUE & MEANING</span>
          </div>
          <p className="text-base sm:text-lg text-purple-100 font-medium">
            "{currentItem.hint}"
          </p>
          {isSolved && (
            <div className="mt-3 pt-3 border-t border-purple-700/40 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{currentItem.meaning}</span>
            </div>
          )}
        </div>

        {/* Word Slot Container */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 transition-transform ${
            errorShake ? 'animate-bounce text-rose-400' : ''
          }`}
        >
          {Array.from({ length: targetWord.length }).map((_, idx) => {
            const letter = currentConstructedWord[idx] || '';
            return (
              <div
                key={idx}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center font-fun text-2xl sm:text-3xl font-extrabold uppercase transition-all duration-200 shadow-md ${
                  letter
                    ? isSolved
                      ? 'bg-emerald-500 text-white border-2 border-emerald-300 scale-105 shadow-emerald-500/40'
                      : 'bg-yellow-400 text-purple-950 border-2 border-yellow-200'
                    : 'bg-purple-950/60 border-2 border-dashed border-purple-600/60 text-purple-400'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        {/* Scrambled Letter Tiles */}
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold tracking-wider text-purple-300">
            Tap letters in order to build the word
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 max-w-lg mx-auto">
            {scrambledList.map((char, idx) => {
              const isUsed = selectedLetterIndices.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={isUsed || isSolved}
                  onClick={() => handleTileClick(idx)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl font-fun text-2xl sm:text-3xl font-extrabold uppercase transition-all duration-150 shadow-lg cursor-pointer ${
                    isUsed
                      ? 'bg-purple-950/40 border border-purple-900 text-purple-700 opacity-20 scale-90 cursor-default'
                      : 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white border-b-4 border-indigo-900 hover:-translate-y-1 active:translate-y-1 hover:shadow-indigo-500/30'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleBackspace}
            disabled={isSolved || selectedLetterIndices.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-purple-900/70 hover:bg-purple-800 disabled:opacity-30 disabled:cursor-default text-purple-200 border border-purple-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Delete className="w-4 h-4" />
            <span>Backspace</span>
          </button>
          <button
            onClick={handleReset}
            disabled={isSolved || selectedLetterIndices.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-purple-900/70 hover:bg-purple-800 disabled:opacity-30 disabled:cursor-default text-purple-200 border border-purple-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => sound.speak(targetWord)}
            className="p-2.5 rounded-2xl bg-purple-900/70 hover:bg-purple-800 text-yellow-300 border border-purple-700 text-xs font-bold cursor-pointer shadow"
            title="Pronounce Word"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-4 flex justify-end">
        {isSolved ? (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-purple-950 font-fun font-bold text-lg shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <span>{currentIndex + 1 < items.length ? 'Next Word' : 'See Results'}</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        ) : (
          <div className="text-center w-full text-xs text-purple-400">
            Spell correctly to earn +150 points
          </div>
        )}
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#210940] border-2 border-purple-600/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-fun text-2xl font-bold text-white">End Game?</h3>
            <p className="text-purple-300 text-sm">
              Are you sure you want to stop building words and leave?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-sm cursor-pointer"
              >
                Keep Playing
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  onEndGame();
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer"
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

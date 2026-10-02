import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, CheckCircle, XCircle, Clock, Zap, Target } from 'lucide-react';
import { PlayerResult } from '../types/quiz';
import { sound } from '../utils/sound';

interface ResultsScreenProps {
  result: PlayerResult;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGoLeaderboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onPlayAgain,
  onGoHome,
  onGoLeaderboard,
}) => {
  useEffect(() => {
    // Sound & Confetti
    sound.playFanfare();

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ff4081', '#00e5ff', '#76ff03', '#e040fb'],
      });
    } catch {
      // Ignore if canvas-confetti issues
    }

    // Save to local score history
    try {
      const stored = localStorage.getItem('wordal_history');
      const history: PlayerResult[] = stored ? JSON.parse(stored) : [];
      history.unshift(result);
      localStorage.setItem('wordal_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save result to history', e);
    }
  }, [result]);

  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-bold text-sm">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>CEFR {result.level} • {result.topic}</span>
        </div>

        <h1 className="font-fun text-4xl sm:text-5xl font-black text-white tracking-wide">
          🎉 Quiz Complete!
        </h1>
        <p className="text-purple-300 text-sm sm:text-base">
          Great effort! Here is your performance breakdown:
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-900/90 via-purple-950 to-[#280c4f] border-2 border-yellow-400/50 shadow-2xl text-center space-y-2 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />

        <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-300/80">
          Total Score
        </span>
        <div className="font-fun text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500">
          {result.score} POINTS
        </div>

        <div className="pt-2 flex items-center justify-center gap-2 text-sm font-semibold text-purple-200">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Accuracy: <strong className="text-white">{result.accuracy}%</strong></span>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-800/50 text-center space-y-1">
          <div className="flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="font-fun text-2xl font-bold text-white">
            {result.correctAnswers}
          </div>
          <div className="text-[11px] font-semibold text-purple-300 uppercase">
            Correct
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-800/50 text-center space-y-1">
          <div className="flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="font-fun text-2xl font-bold text-white">
            {result.wrongAnswers}
          </div>
          <div className="text-[11px] font-semibold text-purple-300 uppercase">
            Wrong
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-800/50 text-center space-y-1">
          <div className="flex items-center justify-center text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <div className="font-fun text-2xl font-bold text-white">
            {result.accuracy}%
          </div>
          <div className="text-[11px] font-semibold text-purple-300 uppercase">
            Accuracy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-800/50 text-center space-y-1">
          <div className="flex items-center justify-center text-yellow-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="font-fun text-2xl font-bold text-white">
            {timeFormatted}
          </div>
          <div className="text-[11px] font-semibold text-purple-300 uppercase">
            Time Taken
          </div>
        </div>
      </div>

      {/* Required Action Buttons: Play Again, Home, Leaderboard */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-base shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-white font-fun font-bold text-base border border-purple-700/60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onGoLeaderboard();
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-yellow-300 font-fun font-bold text-base border border-purple-700/60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md"
        >
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Leaderboard</span>
        </button>
      </div>
    </div>
  );
};

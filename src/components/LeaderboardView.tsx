import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Star, Clock, Target, Trash2 } from 'lucide-react';
import { PlayerResult } from '../types/quiz';
import { sound } from '../utils/sound';

interface LeaderboardViewProps {
  onBackToHome: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBackToHome }) => {
  const [history, setHistory] = useState<PlayerResult[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wordal_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local game history?')) {
      localStorage.removeItem('wordal_history');
      setHistory([]);
      sound.playClick();
    }
  };

  const topScores = [...history].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-semibold text-sm cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Fame</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
          Leaderboard & Stats
        </h1>
        <p className="text-purple-300 text-sm max-w-md mx-auto">
          Your best scores and performance across CEFR levels and categories.
        </p>
      </div>

      {/* Top 3 Podium if entries exist */}
      {topScores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {topScores.slice(0, 3).map((item, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const borders = ['border-yellow-400', 'border-slate-300', 'border-amber-700'];
            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl bg-purple-950/80 border-2 ${borders[idx]} text-center space-y-2 shadow-xl relative overflow-hidden`}
              >
                <div className="text-3xl">{medals[idx]}</div>
                <div className="font-fun text-2xl font-black text-white">
                  {item.score} <span className="text-xs font-bold text-yellow-400">PTS</span>
                </div>
                <div className="text-xs font-bold text-purple-300">
                  {item.category.toUpperCase()} • {item.level}
                </div>
                <div className="text-[11px] text-purple-400 flex items-center justify-center gap-2 pt-1 border-t border-purple-800/40">
                  <span>Accuracy: {item.accuracy}%</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Records Table */}
      <div className="p-6 rounded-3xl bg-purple-950/80 border border-purple-800/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/50">
          <h3 className="font-fun text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Recent Games ({history.length})</span>
          </h3>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-purple-300 space-y-2">
            <div className="text-3xl">🎯</div>
            <p className="font-medium text-sm">No games recorded yet!</p>
            <p className="text-xs text-purple-400">
              Complete a Solo quiz or Multiplayer match to see your scores here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {history.map((game, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-purple-900/60 hover:bg-purple-900/90 border border-purple-800/50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-800 border border-purple-700 flex items-center justify-center text-xs font-black text-yellow-300">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-fun font-bold text-sm text-white flex items-center gap-2">
                      <span>{game.category.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-800 text-purple-200">
                        {game.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-300">
                      Topic: {game.topic} • {game.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-fun text-lg font-extrabold text-yellow-300">
                    {game.score} pts
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    {game.correctAnswers}/{game.totalQuestions} ({game.accuracy}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

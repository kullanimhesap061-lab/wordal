import React from 'react';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  onSoloClick: () => void;
  onMultiplayerClick: () => void;
  onLeaderboardClick: () => void;
  onSettingsClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSoloClick,
  onMultiplayerClick,
  onLeaderboardClick,
  onSettingsClick,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] space-y-8">
      {/* Clean Title */}
      <div className="text-center space-y-1">
        <h1 className="font-fun text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-md">
          Word<span className="text-yellow-400">al!</span>
        </h1>
        <p className="font-fun text-xl sm:text-2xl font-bold text-yellow-300">
          “Learn English. Play. Improve.”
        </p>
      </div>

      {/* Main 4 Action Buttons Only */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Solo Play (Red Theme) */}
        <button
          onClick={() => {
            sound.playClick();
            onSoloClick();
          }}
          className="p-6 rounded-3xl bg-[#e21b3c] hover:bg-[#c01431] border-b-6 border-[#9c0e25] text-left cursor-pointer transition-all duration-150 shadow-xl hover:-translate-y-1 active:translate-y-1 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎮</span>
            <span className="font-fun text-2xl font-extrabold text-white">
              Solo Play
            </span>
          </div>
          <span className="font-fun text-2xl font-black text-white/60">▲</span>
        </button>

        {/* 2. Multiplayer (Blue Theme) */}
        <button
          onClick={() => {
            sound.playClick();
            onMultiplayerClick();
          }}
          className="p-6 rounded-3xl bg-[#1368ce] hover:bg-[#0f54a8] border-b-6 border-[#094186] text-left cursor-pointer transition-all duration-150 shadow-xl hover:-translate-y-1 active:translate-y-1 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">👥</span>
            <span className="font-fun text-2xl font-extrabold text-white">
              Multiplayer
            </span>
          </div>
          <span className="font-fun text-2xl font-black text-white/60">◆</span>
        </button>

        {/* 3. Leaderboard (Yellow Theme) */}
        <button
          onClick={() => {
            sound.playClick();
            onLeaderboardClick();
          }}
          className="p-6 rounded-3xl bg-[#ffa602] hover:bg-[#d98c00] border-b-6 border-[#b36e00] text-left cursor-pointer transition-all duration-150 shadow-xl hover:-translate-y-1 active:translate-y-1 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <span className="font-fun text-2xl font-extrabold text-purple-950">
              Leaderboard
            </span>
          </div>
          <span className="font-fun text-2xl font-black text-purple-950/60">●</span>
        </button>

        {/* 4. Settings (Green Theme) */}
        <button
          onClick={() => {
            sound.playClick();
            onSettingsClick();
          }}
          className="p-6 rounded-3xl bg-[#26890c] hover:bg-[#1f6f0a] border-b-6 border-[#155506] text-left cursor-pointer transition-all duration-150 shadow-xl hover:-translate-y-1 active:translate-y-1 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚙️</span>
            <span className="font-fun text-2xl font-extrabold text-white">
              Settings
            </span>
          </div>
          <span className="font-fun text-2xl font-black text-white/60">■</span>
        </button>
      </div>
    </div>
  );
};

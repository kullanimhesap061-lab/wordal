import React, { useState } from 'react';
import { ArrowLeft, Users, PlusCircle, LogIn, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface MultiplayerMenuProps {
  onBackToHome: () => void;
  onCreateRoomClick: () => void;
  onJoinRoomSubmit: (roomId: string, playerName: string) => void;
  initialRoomCode?: string;
}

export const MultiplayerMenu: React.FC<MultiplayerMenuProps> = ({
  onBackToHome,
  onCreateRoomClick,
  onJoinRoomSubmit,
  initialRoomCode = '',
}) => {
  const [mode, setMode] = useState<'menu' | 'join'>(initialRoomCode ? 'join' : 'menu');
  const [roomId, setRoomId] = useState(initialRoomCode.toUpperCase());
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('wordal_nickname') || ''
  );
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoom = roomId.trim().toUpperCase();
    const cleanName = playerName.trim();

    if (!cleanRoom) {
      setErrorMessage('Please enter the 4-digit Room Code (e.g. 4821)');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter your player nickname');
      return;
    }

    localStorage.setItem('wordal_nickname', cleanName);
    sound.playClick();
    onJoinRoomSubmit(cleanRoom, cleanName);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            if (mode === 'join' && !initialRoomCode) {
              setMode('menu');
            } else {
              onBackToHome();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-semibold text-sm cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>Multiplayer Arena</span>
        </div>
      </div>

      {/* Main Container */}
      {mode === 'menu' ? (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
              Multiplayer Game
            </h1>
            <p className="text-purple-300 text-sm sm:text-base max-w-md mx-auto">
              Challenge friends or classmates in real-time Kahoot-style English quizzes!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Create Room Button */}
            <button
              onClick={() => {
                sound.playClick();
                onCreateRoomClick();
              }}
              className="group p-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border-2 border-yellow-400/50 hover:border-yellow-400 text-left cursor-pointer transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-purple-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-6">
                <PlusCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-fun text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-1.5">
                  Create Room
                </h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Host a game on your screen, get a Room Code & QR code, and invite players.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-800/40 text-xs font-bold text-yellow-300 flex justify-end">
                Configure & Host →
              </div>
            </button>

            {/* Join Room Button */}
            <button
              onClick={() => {
                sound.playClick();
                setMode('join');
              }}
              className="group p-6 rounded-3xl bg-gradient-to-br from-purple-900/60 to-indigo-950/80 border-2 border-purple-600/50 hover:border-purple-400 text-left cursor-pointer transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-6">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-fun text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                  Join Room
                </h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Enter a host's Room Code or join using your smartphone to compete.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-800/40 text-xs font-bold text-indigo-300 flex justify-end">
                Enter Code →
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Join Room Form */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#280c4f] to-[#1a0633] border-2 border-purple-600/60 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-fun text-2xl sm:text-3xl font-extrabold text-white">
              Join Game Room
            </h2>
            <p className="text-purple-300 text-xs sm:text-sm">
              Enter the room code shown on the host's screen and pick your player name.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Room Code (4 Digits)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                  setErrorMessage('');
                }}
                placeholder="4821"
                className="w-full px-4 py-3.5 rounded-2xl bg-purple-950/80 border-2 border-purple-600 focus:border-yellow-400 focus:outline-none text-white font-fun text-2xl tracking-widest text-center placeholder:text-purple-500 transition-all font-black"
                maxLength={4}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Your Nickname
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. Ali, Alex, Sarah"
                className="w-full px-4 py-3 rounded-2xl bg-purple-950/80 border-2 border-purple-600 focus:border-yellow-400 focus:outline-none text-white font-medium text-base text-center placeholder:text-purple-500 transition-all"
                maxLength={15}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 font-fun font-bold text-lg shadow-xl shadow-yellow-500/30 cursor-pointer active:scale-95 transition-all mt-2"
            >
              Enter Room
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

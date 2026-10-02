import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Home } from 'lucide-react';
import { sound } from '../utils/sound';

interface NavbarProps {
  onHomeClick?: () => void;
  onLeaderboardClick?: () => void;
  currentScreen: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, onLeaderboardClick, currentScreen }) => {
  const [muted, setMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playClick();
    }
  };

  return (
    <header className="w-full bg-[#1e073c]/80 backdrop-blur-md border-b border-purple-800/40 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => {
            sound.playClick();
            if (onHomeClick) onHomeClick();
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200"
            style={{
              backgroundColor: '#28044d',
              borderColor: '#28044d',
              color: '#28044d',
            }}
          >
            <span
              className="font-fun text-2xl font-bold"
              style={{ color: '#28044d' }}
            >
              W!
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="font-fun font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300"
                style={{
                  paddingLeft: '7px',
                  paddingRight: '6px',
                  paddingTop: '0px',
                  marginLeft: '-31px',
                  marginRight: '-11px',
                  marginTop: '3px',
                  borderRadius: '36px',
                  borderWidth: '-3px',
                  fontSize: '33px',
                  lineHeight: '33px',
                }}
              >
                Wordal!
              </span>
              <span
                className="hidden sm:inline-flex items-center gap-0.5 rounded-full text-[10px] font-bold border overflow-hidden"
                style={{
                  color: '#28044d',
                  borderColor: '#28044d',
                  backgroundColor: '#28044d',
                  paddingLeft: '26px',
                  paddingRight: '6px',
                  paddingTop: '8px',
                  paddingBottom: '11px',
                  marginLeft: '58px',
                  marginRight: '15px',
                  width: '0px',
                  height: '0px',
                  marginBottom: '12px',
                }}
              >
                <Sparkles className="w-2.5 h-2.5" /> LIVE
              </span>
            </div>
            <p
              className="text-[11px] font-medium hidden sm:block"
              style={{ color: '#28044d' }}
            >
              Learn English. Play. Improve.
            </p>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentScreen !== 'home' && onHomeClick && (
            <button
              onClick={() => {
                sound.playClick();
                onHomeClick();
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
              title="Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {onLeaderboardClick && (
            <button
              onClick={() => {
                sound.playClick();
                onLeaderboardClick();
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-yellow-300 border border-purple-700/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="hidden sm:inline">Ranks</span>
            </button>
          )}

          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50 cursor-pointer transition-colors"
            title={muted ? 'Unmute audio' : 'Mute audio'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

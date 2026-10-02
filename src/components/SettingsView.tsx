import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, User, Sparkles, Check, Play } from 'lucide-react';
import { sound } from '../utils/sound';

interface SettingsViewProps {
  onBackToHome: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToHome }) => {
  const [muted, setMuted] = useState(sound.getMuted());
  const [nickname, setNickname] = useState(
    () => localStorage.getItem('wordal_nickname') || 'WordalPlayer'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playClick();
    }
  };

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    localStorage.setItem('wordal_nickname', nickname.trim() || 'WordalPlayer');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestAudio = () => {
    sound.speak('Welcome to Wordal! Learn English, play, and improve!');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
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

        <div className="text-xs font-bold text-purple-300 bg-purple-900/50 px-3 py-1.5 rounded-full border border-purple-700/40">
          Preferences
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
          Settings
        </h1>
        <p className="text-purple-300 text-sm">
          Customize your sound, pronunciation voice, and player profile.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-purple-950/80 border border-purple-800/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-fun text-lg font-bold">
            <User className="w-5 h-5 text-yellow-400" />
            <span>Player Nickname</span>
          </div>

          <form onSubmit={handleSaveNickname} className="space-y-3">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={15}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-2xl bg-purple-900/70 border border-purple-600 focus:border-yellow-400 text-white font-fun text-base outline-none transition-all"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-purple-800 hover:bg-purple-700 text-yellow-300 font-fun font-bold text-sm border border-purple-600 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Nickname</span>
              )}
            </button>
          </form>
        </div>

        {/* Audio Settings Card */}
        <div className="p-6 rounded-3xl bg-purple-950/80 border border-purple-800/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fun text-lg font-bold text-white flex items-center gap-2">
                {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                <span>Sound Effects</span>
              </h3>
              <p className="text-xs text-purple-300">
                Chimes, correct/wrong sound effects, and celebratory fanfares.
              </p>
            </div>

            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-2xl font-fun font-bold text-xs cursor-pointer shadow transition-all ${
                muted
                  ? 'bg-rose-900/60 border border-rose-600 text-rose-200'
                  : 'bg-emerald-600 text-white shadow-emerald-600/30'
              }`}
            >
              {muted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          <div className="pt-3 border-t border-purple-800/40 flex items-center justify-between">
            <div>
              <h4 className="font-fun text-sm font-bold text-white">
                Audio Pronunciation (TTS)
              </h4>
              <p className="text-xs text-purple-300">
                Native voice speaker for learning pronunciation.
              </p>
            </div>

            <button
              onClick={handleTestAudio}
              className="px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 border border-purple-700 text-yellow-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-900/60 text-center space-y-1">
          <div className="font-fun text-sm font-bold text-white">Wordal! v1.0.0</div>
          <p className="text-xs text-purple-400">
            Powered by Cambridge CEFR standards & Gemini AI engine
          </p>
        </div>
      </div>
    </div>
  );
};

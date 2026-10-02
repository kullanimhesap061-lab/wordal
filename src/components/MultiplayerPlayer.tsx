import React, { useState, useEffect } from 'react';
import { Lock, Check, X, Award, Zap, Timer, LogOut, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface MultiplayerPlayerProps {
  roomId: string;
  playerName: string;
  ws: WebSocket;
  onExit: () => void;
}

const KAHOOT_THEMES = [
  {
    letter: 'A',
    symbol: '▲',
    bg: 'bg-[#e21b3c]',
    shadow: 'border-[#9c0e25]',
    active: 'active:bg-[#c01431]',
  },
  {
    letter: 'B',
    symbol: '◆',
    bg: 'bg-[#1368ce]',
    shadow: 'border-[#094186]',
    active: 'active:bg-[#0f54a8]',
  },
  {
    letter: 'C',
    symbol: '●',
    bg: 'bg-[#ffa602]',
    shadow: 'border-[#b36e00]',
    active: 'active:bg-[#d98c00]',
  },
  {
    letter: 'D',
    symbol: '■',
    bg: 'bg-[#26890c]',
    shadow: 'border-[#155506]',
    active: 'active:bg-[#1f6f0a]',
  },
];

export const MultiplayerPlayer: React.FC<MultiplayerPlayerProps> = ({
  roomId,
  playerName,
  ws,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'question' | 'locked' | 'reveal' | 'finished'>('waiting');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    options: string[];
    imageUrl?: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hostLeftMessage, setHostLeftMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'game_started' || msg.type === 'new_question') {
          setGameState('question');
          setCurrentQuestionIndex(msg.questionIndex);
          setTotalQuestions(msg.totalQuestions);
          setCurrentQuestion(msg.question);
          setSelectedOption(null);
          setCorrectAnswer(null);
          setTimeLeft(msg.timeLimit || 20);

          // Update my score from players list
          const me = msg.players?.find((p: { name: string }) => p.name === playerName);
          if (me) {
            setMyScore(me.score || 0);
            setMyStreak(me.streak || 0);
          }
        } else if (msg.type === 'answer_locked') {
          setGameState('locked');
          setSelectedOption(msg.selectedOption);
        } else if (msg.type === 'round_revealed') {
          setGameState('reveal');
          setCorrectAnswer(msg.correctAnswer);

          // Find my updated score and rank
          if (Array.isArray(msg.players)) {
            const meIndex = msg.players.findIndex((p: { name: string }) => p.name === playerName);
            if (meIndex !== -1) {
              setMyRank(meIndex + 1);
              setMyScore(msg.players[meIndex].score);
              setMyStreak(msg.players[meIndex].streak);

              if (msg.players[meIndex].isCorrect) {
                sound.playCorrect();
              } else {
                sound.playWrong();
              }
            }
          }
        } else if (msg.type === 'game_finished') {
          setGameState('finished');
          if (Array.isArray(msg.leaderboard)) {
            const meIndex = msg.leaderboard.findIndex((p: { name: string }) => p.name === playerName);
            if (meIndex !== -1) {
              setMyRank(meIndex + 1);
              setMyScore(msg.leaderboard[meIndex].score);
            }
          }
          sound.playFanfare();
        } else if (msg.type === 'host_left') {
          setHostLeftMessage(msg.message || 'Host has left the game.');
        }
      } catch (err) {
        console.error('Player WS message error', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, playerName]);

  const handleSelectOption = (idx: number) => {
    if (gameState !== 'question') return;
    sound.playClick();
    setSelectedOption(idx);
    setGameState('locked');

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'submit_answer',
          roomId,
          optionIndex: idx,
        })
      );
    }
  };

  if (hostLeftMessage) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-purple-950/80 border-2 border-purple-700/60 shadow-2xl space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-fun text-2xl font-bold text-white">Room Closed</h2>
          <p className="text-purple-300 text-sm">{hostLeftMessage}</p>
          <button
            onClick={onExit}
            className="w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-base cursor-pointer shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-80px)] justify-between">
      {/* Top Bar with Player Identity and Score */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-700 flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <div className="font-fun font-bold text-sm text-white">{playerName}</div>
            <div className="text-[10px] text-purple-400">Room: {roomId}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">
            <Award className="w-3.5 h-3.5" />
            <span className="font-fun text-sm font-extrabold">{myScore}</span>
          </div>

          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-300 text-xs cursor-pointer"
            title="Leave Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WAITING LOBBY */}
      {gameState === 'waiting' && (
        <div className="my-auto text-center space-y-6 py-12">
          <div className="w-20 h-20 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center mx-auto text-4xl animate-bounce">
            🎮
          </div>
          <div className="space-y-2">
            <h2 className="font-fun text-3xl font-extrabold text-white">
              You're In!
            </h2>
            <p className="text-purple-300 text-sm max-w-xs mx-auto">
              Look up at the host's screen. The quiz will start shortly!
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-900/80 border border-purple-700 text-purple-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Connected to room {roomId}</span>
          </div>
        </div>
      )}

      {/* QUESTION IN PROGRESS / LOCKED / REVEAL - CONTROLLER MODE */}
      {(gameState === 'question' || gameState === 'locked' || gameState === 'reveal') && currentQuestion && (
        <div className="my-auto space-y-5 py-2 w-full">
          {/* Compact Question Counter & Look at screen reminder */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold bg-purple-900/80 px-3 py-1 rounded-full border border-purple-700">
              <span>📺 Look at host screen</span>
            </div>
          </div>

          {/* Locked State Banner */}
          {gameState === 'locked' && (
            <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-center space-y-1 animate-pulse">
              <div className="flex items-center justify-center gap-2 font-fun text-lg font-extrabold text-cyan-300">
                <Lock className="w-5 h-5" />
                <span>Answer Locked!</span>
              </div>
              <p className="text-xs text-cyan-200">
                Waiting for reveal on the host screen...
              </p>
            </div>
          )}

          {/* Reveal Result Banner */}
          {gameState === 'reveal' && (
            <div
              className={`p-4 rounded-2xl text-center space-y-1 ${
                selectedOption === correctAnswer
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200'
                  : 'bg-rose-500/20 border-2 border-rose-400 text-rose-200'
              }`}
            >
              <div className="font-fun text-2xl font-black flex items-center justify-center gap-2">
                {selectedOption === correctAnswer ? (
                  <>
                    <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-300">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6 text-rose-400 stroke-[3]" />
                    <span className="text-rose-300">Incorrect!</span>
                  </>
                )}
              </div>
              {myRank && (
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Your Current Rank: #{myRank}</span>
                </div>
              )}
            </div>
          )}

          {/* Big 4 Kahoot-Style Touch Answer Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = correctAnswer === idx;

              let buttonState = `${theme.bg} ${theme.shadow} text-white border-b-6`;

              if (gameState === 'locked') {
                if (isSelected) {
                  buttonState = `${theme.bg} border-b-6 border-white ring-4 ring-white text-white scale-98`;
                } else {
                  buttonState = 'bg-purple-950/40 border-b-6 border-purple-900 opacity-30 text-purple-400';
                }
              } else if (gameState === 'reveal') {
                if (isCorrectAnswer) {
                  buttonState = 'bg-emerald-600 border-b-6 border-emerald-950 ring-4 ring-emerald-300 text-white';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonState = 'bg-rose-700 border-b-6 border-rose-950 opacity-60 text-white';
                } else {
                  buttonState = 'bg-purple-950/40 border-b-6 border-purple-900 opacity-20 text-purple-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={gameState !== 'question'}
                  onClick={() => handleSelectOption(idx)}
                  className={`relative p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 min-h-[130px] sm:min-h-[150px] ${buttonState} ${
                    gameState === 'question' ? 'hover:-translate-y-1 active:translate-y-1 active:shadow-none' : 'cursor-default'
                  }`}
                >
                  <span className="font-fun text-4xl sm:text-5xl font-extrabold mb-1">
                    {theme.symbol}
                  </span>
                  <span className="font-fun text-base sm:text-lg font-bold leading-tight line-clamp-2">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FINAL FINISHED VIEW */}
      {gameState === 'finished' && (
        <div className="my-auto p-8 rounded-3xl bg-purple-950/90 border-2 border-yellow-400/60 text-center space-y-6 shadow-2xl">
          <div className="text-5xl">🏆</div>
          <div className="space-y-1">
            <h2 className="font-fun text-3xl font-extrabold text-white">
              Quiz Finished!
            </h2>
            <p className="text-purple-300 text-sm">
              Great game, {playerName}!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-900/80 border border-purple-700/60 space-y-2">
            <span className="text-xs uppercase font-extrabold text-yellow-300">
              Your Final Standing
            </span>
            <div className="font-fun text-4xl font-black text-white">
              {myRank ? `#${myRank} Place` : 'Ranked'}
            </div>
            <div className="text-lg font-extrabold text-yellow-400">
              {myScore} POINTS
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-base cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            Back to Main Menu
          </button>
        </div>
      )}
    </div>
  );
};

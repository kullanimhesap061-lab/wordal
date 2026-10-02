import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Users, Copy, Check, Play, Timer, Sparkles, Trophy, Crown, ArrowRight, LogOut, Volume2 } from 'lucide-react';
import { GameSettings, Question } from '../types/quiz';
import { sound } from '../utils/sound';
import { getFallbackQuestions } from '../data/fallbackQuestions';

interface MultiplayerHostProps {
  roomId: string;
  settings: GameSettings;
  ws: WebSocket;
  onExit: () => void;
}

interface PlayerInfo {
  id: string;
  name: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedOption?: number;
  isCorrect?: boolean;
}

const KAHOOT_THEMES = [
  { symbol: '▲', color: 'bg-[#e21b3c] border-[#9c0e25]', name: 'Red' },
  { symbol: '◆', color: 'bg-[#1368ce] border-[#094186]', name: 'Blue' },
  { symbol: '●', color: 'bg-[#ffa602] border-[#b36e00]', name: 'Yellow' },
  { symbol: '■', color: 'bg-[#26890c] border-[#155506]', name: 'Green' },
];

export const MultiplayerHost: React.FC<MultiplayerHostProps> = ({
  roomId,
  settings,
  ws,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'lobby' | 'question' | 'reveal' | 'finished'>('lobby');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(Number(settings.count) || 10);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    options: string[];
    imageUrl?: string;
  } | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [leaderboard, setLeaderboard] = useState<PlayerInfo[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionsListRef = useRef<Question[]>([]);

  // Generate QR Code with join URL
  useEffect(() => {
    const joinUrl = `${window.location.origin}?room=${roomId}`;

    QRCode.toDataURL(joinUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e073c',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [roomId]);

  // WebSocket message receiver
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'player_list_update') {
          setPlayers(msg.players || []);
        } else if (msg.type === 'game_started' || msg.type === 'new_question') {
          if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
          setRevealCountdown(null);
          setGameState('question');
          setCurrentQuestionIndex(msg.questionIndex);
          setTotalQuestions(msg.totalQuestions);
          if (msg.question) {
            setCurrentQuestion(msg.question);
          }
          setCorrectAnswer(null);
          setExplanation(null);
          setTimeLeft(msg.timeLimit || 20);
          setPlayers(msg.players || []);

          if (msg.question?.question) {
            try {
              sound.speak(msg.question.question);
            } catch {
              // Ignore
            }
          }

          startTimer(msg.timeLimit || 20);
        } else if (msg.type === 'player_answered') {
          setPlayers(msg.players || []);
          sound.playTick();
        } else if (msg.type === 'round_revealed') {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState('reveal');
          setCorrectAnswer(msg.correctAnswer);
          setExplanation(msg.explanation);
          setPlayers(msg.players || []);
          sound.playCorrect();

          // Auto-advance to next question after 6 seconds if host doesn't click
          if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
          let count = 6;
          setRevealCountdown(count);
          autoAdvanceTimerRef.current = setInterval(() => {
            count -= 1;
            setRevealCountdown(count);
            if (count <= 0) {
              if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
              setRevealCountdown(null);
              advanceToNextQuestion();
            }
          }, 1000);
        } else if (msg.type === 'game_finished') {
          if (timerRef.current) clearInterval(timerRef.current);
          if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
          setRevealCountdown(null);
          setGameState('finished');
          setLeaderboard(msg.leaderboard || []);
          sound.playFanfare();
        }
      } catch (err) {
        console.error('Host WS message error', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    };
  }, [ws]);

  const startTimer = (limit: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Request answer reveal from server
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'reveal_answer', roomId }));
          }
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const advanceToNextQuestion = () => {
    sound.playClick();
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    setRevealCountdown(null);

    const nextIdx = currentQuestionIndex + 1;
    const allQ = questionsListRef.current;

    if (allQ.length > 0 && nextIdx < allQ.length) {
      setCurrentQuestionIndex(nextIdx);
      setCurrentQuestion({
        question: allQ[nextIdx].question,
        options: allQ[nextIdx].options,
        imageUrl: allQ[nextIdx].imageUrl,
      });
      setCorrectAnswer(null);
      setExplanation(null);
      setGameState('question');
      startTimer(20);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'next_question', roomId }));
      }
    } else {
      setGameState('finished');
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end_game', roomId }));
      }
    }
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      alert('Wait for at least one player to join the room!');
      return;
    }
    sound.playClick();
    setIsGeneratingQuestions(true);

    try {
      // Generate questions immediately so game starts with 0 delay and no blank screen
      const questions = getFallbackQuestions(
        settings.category as any,
        Number(settings.count) || 10,
        settings.level as any,
        settings.topic
      );

      questionsListRef.current = questions;

      if (questions.length > 0) {
        setCurrentQuestion({
          question: questions[0].question,
          options: questions[0].options,
          imageUrl: questions[0].imageUrl,
        });
        setCurrentQuestionIndex(0);
        setTotalQuestions(questions.length);
        setGameState('question');
        startTimer(20);
      }

      // Send to server to start game for all connected participants
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'start_game',
            roomId,
            questions,
          })
        );
      }
    } catch (e) {
      console.error('Failed to prepare game questions:', e);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'start_game', roomId }));
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleNextQuestion = () => {
    advanceToNextQuestion();
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    sound.playClick();
    const joinUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-purple-950/80 p-4 rounded-3xl border border-purple-800/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-yellow-400 text-purple-950 font-fun font-bold text-sm tracking-wide shadow-md">
            HOST SCREEN
          </div>
          <div>
            <div className="font-fun text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>{roomId}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-lg hover:bg-purple-800 text-purple-300 transition-colors cursor-pointer"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-purple-300">
              {settings.category.toUpperCase()} • {settings.level} • {settings.topic}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-900/60 border border-purple-700/40 text-purple-200 text-xs font-bold">
            <Users className="w-4 h-4 text-yellow-400" />
            <span>{players.length} Players</span>
          </div>

          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700/50 cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* LOBBY VIEW */}
      {gameState === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Code & Join Instructions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2a0d52] to-[#1a0735] border-2 border-purple-600/60 text-center space-y-4 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Scan or Share Link to Join
              </span>
              <h2 className="font-fun text-2xl font-extrabold text-white">
                Join at {window.location.host}
              </h2>
            </div>

            {/* QR Code Image */}
            <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl mx-auto border-4 border-yellow-400">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for room ${roomId}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-purple-950 font-bold">
                  Loading QR...
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700/50 flex items-center gap-1.5 cursor-pointer shadow"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
            </div>
          </div>

          {/* Connected Players Lobby */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2a0d52] to-[#1a0735] border-2 border-purple-600/60 flex flex-col justify-between min-h-[380px] shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
                <h3 className="font-fun text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span>Waiting for Players...</span>
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-300">
                  {players.length} ready
                </span>
              </div>

              {players.length === 0 ? (
                <div className="py-12 text-center text-purple-300 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-900/60 border border-purple-700 flex items-center justify-center mx-auto text-2xl animate-pulse">
                    👤
                  </div>
                  <p className="text-sm font-medium">No players joined yet</p>
                  <p className="text-xs text-purple-400">
                    Scan the QR code or enter code <strong>{roomId}</strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-2.5 rounded-2xl bg-purple-900/90 border border-purple-600 text-white font-fun font-bold text-sm flex items-center gap-2 shadow-md animate-fadeIn"
                    >
                      <span className="text-base">👤</span>
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleStartGame}
              disabled={isGeneratingQuestions || players.length === 0}
              className="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-fun font-bold text-lg shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              {isGeneratingQuestions ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Preparing AI Questions...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Game ({players.length} Players)</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* QUESTION OR REVEAL VIEW */}
      {(gameState === 'question' || gameState === 'reveal') && (
        <div className="space-y-6">
          {!currentQuestion ? (
            <div className="p-12 text-center text-white font-fun text-xl animate-pulse bg-purple-900/40 rounded-3xl border border-purple-700/50">
              Loading question...
            </div>
          ) : (
            <>
              {/* Question Info & Timer Bar */}
              <div className="flex items-center justify-between">
                <span className="font-fun text-xl font-bold text-white">
                  Question {currentQuestionIndex + 1} / {totalQuestions}
                </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-purple-900/80 border border-purple-700 text-yellow-300 font-bold">
                <Timer className="w-4 h-4 text-yellow-400" />
                <span className={timeLeft <= 5 ? 'text-rose-400 animate-pulse' : ''}>
                  {timeLeft}s
                </span>
              </div>

              {gameState === 'reveal' && (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-sm shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>
                    {currentQuestionIndex + 1 < totalQuestions
                      ? `Next Question (${revealCountdown ?? 6}s)`
                      : 'Final Results'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Big Question Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2d1257] to-[#1c0838] border-2 border-purple-600/50 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-center gap-3">
              <h2 className="font-fun text-2xl sm:text-3xl font-extrabold text-white">
                {currentQuestion.question}
              </h2>
              <button
                onClick={() => sound.speak(currentQuestion.question)}
                className="p-2 rounded-full bg-purple-800 text-yellow-300 hover:bg-purple-700 cursor-pointer"
                title="Pronounce"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {currentQuestion.imageUrl && (
              <div className="max-w-sm mx-auto">
                {currentQuestion.imageUrl.includes('flagcdn') ? (
                  <div className="relative inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-yellow-400/60 shadow-xl">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Flag Clue"
                      className="h-32 sm:h-40 w-auto rounded-lg object-contain shadow-md mx-auto"
                    />
                  </div>
                ) : (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Clue"
                    className="w-full max-w-sm max-h-56 object-cover object-center rounded-2xl mx-auto border-2 border-purple-500/40 shadow-lg"
                  />
                )}
              </div>
            )}

            {gameState === 'reveal' && explanation && (
              <div className="p-3 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-sm">
                <strong className="text-yellow-300">Answer Tip: </strong>
                {explanation}
              </div>
            )}
          </div>

          {/* 4 Colored Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
              const isCorrectAnswer = correctAnswer === idx;

              let cardStyle = `${theme.color} text-white border-b-6`;
              if (gameState === 'reveal') {
                if (isCorrectAnswer) {
                  cardStyle = 'bg-emerald-600 border-b-6 border-emerald-900 ring-4 ring-emerald-300 text-white';
                } else {
                  cardStyle = 'bg-purple-950/60 border-b-6 border-purple-900 opacity-40 text-purple-400';
                }
              }

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl flex items-center justify-between shadow-lg ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center font-fun text-xl font-bold">
                      {theme.symbol}
                    </div>
                    <span className="font-fun text-xl font-bold">{opt}</span>
                  </div>
                  {gameState === 'reveal' && isCorrectAnswer && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-emerald-700 shadow">
                      CORRECT ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Player Answer Status Tracker (Requirement 16) */}
          <div className="p-5 rounded-3xl bg-purple-950/80 border border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                Player Responses ({players.filter((p) => p.answered).length}/{players.length})
              </span>
              <span className="text-xs text-purple-400 font-semibold">
                Live Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((p) => {
                let badge = (
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <span className="animate-pulse">⏳</span> waiting...
                  </span>
                );

                if (gameState === 'reveal') {
                  badge = p.isCorrect ? (
                    <span className="text-emerald-400 font-black text-xs">✓ Correct (+pts)</span>
                  ) : (
                    <span className="text-rose-400 font-black text-xs">✗ Incorrect</span>
                  );
                } else if (p.answered) {
                  badge = <span className="text-cyan-400 font-bold text-xs">✓ Locked</span>;
                }

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-purple-900/60 border border-purple-700/50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-fun font-bold text-sm text-white truncate mr-2">
                        👤 {p.name}
                      </span>
                      <span className="font-fun text-xs text-yellow-300 font-extrabold">
                        {p.score}
                      </span>
                    </div>
                    <div className="mt-1">{badge}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* FINAL FINISHED VIEW & PODIUM LEADERBOARD (Requirement 18) */}
      {gameState === 'finished' && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#2a0e50] to-[#180630] border-2 border-yellow-400/60 text-center space-y-8 shadow-2xl">
          <div className="space-y-2">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="font-fun text-4xl sm:text-5xl font-black text-white">
              Game Over!
            </h2>
            <p className="text-purple-300 text-base">
              Here are the champion players of room <strong>{roomId}</strong>:
            </p>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-3 sm:gap-4 max-w-lg mx-auto pt-6 pb-2">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="flex-1 flex flex-col items-center">
                <span className="font-fun text-sm font-bold text-purple-200 mb-1 truncate max-w-[100px]">
                  {leaderboard[1].name}
                </span>
                <span className="text-xs font-bold text-yellow-300 mb-2">
                  {leaderboard[1].score} pts
                </span>
                <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-gray-600 to-slate-400 flex items-center justify-center font-fun text-3xl font-extrabold text-white shadow-xl">
                  🥈
                </div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="flex-1 flex flex-col items-center">
                <Crown className="w-8 h-8 text-yellow-300 -mb-1 animate-pulse" />
                <span className="font-fun text-base font-extrabold text-white mb-1 truncate max-w-[120px]">
                  {leaderboard[0].name}
                </span>
                <span className="text-sm font-black text-yellow-300 mb-2">
                  {leaderboard[0].score} pts
                </span>
                <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-600 to-yellow-400 flex items-center justify-center font-fun text-4xl font-extrabold text-purple-950 shadow-2xl">
                  🥇
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="flex-1 flex flex-col items-center">
                <span className="font-fun text-sm font-bold text-purple-200 mb-1 truncate max-w-[100px]">
                  {leaderboard[2].name}
                </span>
                <span className="text-xs font-bold text-yellow-300 mb-2">
                  {leaderboard[2].score} pts
                </span>
                <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-800 to-amber-700 flex items-center justify-center font-fun text-2xl font-extrabold text-white shadow-lg">
                  🥉
                </div>
              </div>
            )}
          </div>

          {/* Full ranking table */}
          <div className="max-w-md mx-auto space-y-2">
            {leaderboard.map((p, rank) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-fun font-extrabold text-yellow-400 w-6 text-center">
                    #{rank + 1}
                  </span>
                  <span className="font-fun font-bold text-white text-base">
                    {p.name}
                  </span>
                </div>
                <span className="font-fun font-extrabold text-yellow-300 text-lg">
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onExit}
            className="px-8 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-fun font-bold text-base shadow-xl shadow-yellow-500/30 cursor-pointer active:scale-95 transition-all"
          >
            Return to Main Menu
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { SoloSelection } from './components/SoloSelection';
import { QuizScreen } from './components/QuizScreen';
import { WordBuildScreen } from './components/WordBuildScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { MultiplayerMenu } from './components/MultiplayerMenu';
import { MultiplayerHost } from './components/MultiplayerHost';
import { MultiplayerPlayer } from './components/MultiplayerPlayer';
import { LeaderboardView } from './components/LeaderboardView';
import { SettingsView } from './components/SettingsView';
import { GameSettings, Question, WordBuildItem, PlayerResult } from './types/quiz';
import { getFallbackQuestions, WORD_BUILD_PUZZLES } from './data/fallbackQuestions';
import { sound } from './utils/sound';
import { Sparkles, Brain, Loader2 } from 'lucide-react';

type Screen =
  | 'home'
  | 'solo-select'
  | 'solo-loading'
  | 'quiz'
  | 'word-build'
  | 'results'
  | 'multiplayer-menu'
  | 'multiplayer-config'
  | 'multiplayer-host'
  | 'multiplayer-player'
  | 'leaderboard'
  | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentSettings, setCurrentSettings] = useState<GameSettings>({
    category: 'vocabulary',
    level: 'B1',
    topic: 'General',
    count: 10,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [wordBuildItems, setWordBuildItems] = useState<WordBuildItem[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [lastResult, setLastResult] = useState<PlayerResult | null>(null);

  // Multiplayer State
  const [multiplayerRoomId, setMultiplayerRoomId] = useState<string>('');
  const [multiplayerPlayerName, setMultiplayerPlayerName] = useState<string>('');
  const [initialRoomFromUrl, setInitialRoomFromUrl] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Check URL query parameters for ?room=XXXX
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        const cleanCode = roomParam.replace(/^WORDAL-?/i, '').trim();
        setInitialRoomFromUrl(cleanCode);
        setCurrentScreen('multiplayer-menu');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Helper to open or reuse WebSocket
  const getWebSocket = (): WebSocket => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    return ws;
  };

  // Solo Start Quiz flow
  const handleStartSoloQuiz = async (settings: GameSettings) => {
    setCurrentSettings(settings);
    setCurrentScreen('solo-loading');

    const countNum =
      typeof settings.count === 'number'
        ? settings.count
        : Math.floor(Math.random() * 3) * 5 + 5;

    // Word Build special mode
    if (settings.category === 'word-build') {
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: settings.category,
            level: settings.level,
            topic: settings.topic,
            count: countNum,
          }),
        });
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setWordBuildItems(data.items);
        } else {
          setWordBuildItems(WORD_BUILD_PUZZLES.slice(0, countNum));
        }
      } catch {
        setWordBuildItems(WORD_BUILD_PUZZLES.slice(0, countNum));
      }
      setCurrentScreen('word-build');
      return;
    }

    // Standard Quiz Mode (Vocabulary, Grammar, Complete It, Picture It, Maps)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: settings.category,
          level: settings.level,
          topic: settings.topic,
          count: countNum,
        }),
      });

      const data = await res.json();

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setIsFallback(Boolean(data.isFallback));
      } else {
        const fb = getFallbackQuestions(settings.category, countNum);
        setQuestions(fb);
        setIsFallback(true);
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
      const fb = getFallbackQuestions(settings.category, countNum);
      setQuestions(fb);
      setIsFallback(true);
    }

    setCurrentScreen('quiz');
  };

  // Solo Play Again handler
  const handlePlayAgain = () => {
    handleStartSoloQuiz(currentSettings);
  };

  // Handle Quiz Finish
  const handleQuizFinish = (result: PlayerResult) => {
    setLastResult(result);
    setCurrentScreen('results');
  };

  // Multiplayer: Host creates room
  const handleCreateRoom = (settings: GameSettings) => {
    setCurrentSettings(settings);
    const ws = getWebSocket();

    const sendCreate = () => {
      ws.send(
        JSON.stringify({
          type: 'create_room',
          settings: {
            category: settings.category,
            level: settings.level,
            topic: settings.topic,
            count: settings.count === 'random' ? 10 : settings.count,
          },
        })
      );
    };

    if (ws.readyState === WebSocket.OPEN) {
      sendCreate();
    } else {
      ws.onopen = () => sendCreate();
    }

    // Wait for room_created
    const onMsg = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room_created') {
          ws.removeEventListener('message', onMsg);
          setMultiplayerRoomId(msg.roomId);
          setCurrentScreen('multiplayer-host');
        }
      } catch {
        // Ignore
      }
    };
    ws.addEventListener('message', onMsg);
  };

  // Multiplayer: Player joins room
  const handleJoinRoom = (roomId: string, playerName: string) => {
    setMultiplayerRoomId(roomId);
    setMultiplayerPlayerName(playerName);
    const ws = getWebSocket();

    const sendJoin = () => {
      ws.send(
        JSON.stringify({
          type: 'join_room',
          roomId,
          playerName,
        })
      );
    };

    if (ws.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      ws.onopen = () => sendJoin();
    }

    // Wait for joined_room or error
    const onMsg = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'joined_room') {
          ws.removeEventListener('message', onMsg);
          setCurrentScreen('multiplayer-player');
        } else if (msg.type === 'error') {
          ws.removeEventListener('message', onMsg);
          alert(msg.message || 'Could not join room');
        }
      } catch {
        // Ignore
      }
    };
    ws.addEventListener('message', onMsg);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-yellow-400 selection:text-purple-950 font-sans">
      {/* Persistent Navigation Header */}
      <Navbar
        currentScreen={currentScreen}
        onHomeClick={() => {
          // If in multiplayer game, close ws if needed
          if (currentScreen === 'multiplayer-host' || currentScreen === 'multiplayer-player') {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.close();
            }
          }
          setCurrentScreen('home');
        }}
        onLeaderboardClick={() => setCurrentScreen('leaderboard')}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col justify-center">
        {/* 1. HOME SCREEN */}
        {currentScreen === 'home' && (
          <HomeScreen
            onSoloClick={() => setCurrentScreen('solo-select')}
            onMultiplayerClick={() => setCurrentScreen('multiplayer-menu')}
            onLeaderboardClick={() => setCurrentScreen('leaderboard')}
            onSettingsClick={() => setCurrentScreen('settings')}
          />
        )}

        {/* 2. SOLO SELECTION WIZARD */}
        {currentScreen === 'solo-select' && (
          <SoloSelection
            onBackToHome={() => setCurrentScreen('home')}
            onStartQuiz={handleStartSoloQuiz}
          />
        )}

        {/* 3. SOLO LOADING SCREEN */}
        {currentScreen === 'solo-loading' && (
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                <Brain className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>

            <h2 className="font-fun text-2xl font-extrabold text-white">
              Loading {currentSettings.topic}...
            </h2>
          </div>
        )}

        {/* 4. QUIZ SCREEN */}
        {currentScreen === 'quiz' && (
          <QuizScreen
            settings={currentSettings}
            questions={questions}
            isFallback={isFallback}
            onEndGame={() => setCurrentScreen('home')}
            onFinish={handleQuizFinish}
          />
        )}

        {/* 5. WORD BUILD SCREEN */}
        {currentScreen === 'word-build' && (
          <WordBuildScreen
            items={wordBuildItems}
            onEndGame={() => setCurrentScreen('home')}
            onFinish={handleQuizFinish}
          />
        )}

        {/* 6. RESULTS SCREEN */}
        {currentScreen === 'results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            onPlayAgain={handlePlayAgain}
            onGoHome={() => setCurrentScreen('home')}
            onGoLeaderboard={() => setCurrentScreen('leaderboard')}
          />
        )}

        {/* 7. MULTIPLAYER MENU */}
        {currentScreen === 'multiplayer-menu' && (
          <MultiplayerMenu
            initialRoomCode={initialRoomFromUrl}
            onBackToHome={() => setCurrentScreen('home')}
            onCreateRoomClick={() => setCurrentScreen('multiplayer-config')}
            onJoinRoomSubmit={handleJoinRoom}
          />
        )}

        {/* 8. MULTIPLAYER HOST CONFIGURATION */}
        {currentScreen === 'multiplayer-config' && (
          <SoloSelection
            onBackToHome={() => setCurrentScreen('multiplayer-menu')}
            onStartQuiz={handleCreateRoom}
          />
        )}

        {/* 9. MULTIPLAYER HOST SCREEN */}
        {currentScreen === 'multiplayer-host' && wsRef.current && (
          <MultiplayerHost
            roomId={multiplayerRoomId}
            settings={currentSettings}
            ws={wsRef.current}
            onExit={() => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
              }
              setCurrentScreen('home');
            }}
          />
        )}

        {/* 10. MULTIPLAYER PLAYER SCREEN */}
        {currentScreen === 'multiplayer-player' && wsRef.current && (
          <MultiplayerPlayer
            roomId={multiplayerRoomId}
            playerName={multiplayerPlayerName}
            ws={wsRef.current}
            onExit={() => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
              }
              setCurrentScreen('home');
            }}
          />
        )}

        {/* 11. LEADERBOARD SCREEN */}
        {currentScreen === 'leaderboard' && (
          <LeaderboardView onBackToHome={() => setCurrentScreen('home')} />
        )}

        {/* 12. SETTINGS SCREEN */}
        {currentScreen === 'settings' && (
          <SettingsView onBackToHome={() => setCurrentScreen('home')} />
        )}
      </main>
    </div>
  );
}

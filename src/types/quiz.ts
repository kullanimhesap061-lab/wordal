export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type CategoryId = 
  | 'vocabulary'
  | 'grammar'
  | 'complete-it'
  | 'picture-it'
  | 'maps'
  | 'word-build';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: string;
  badge: string;
  topics: string[];
}

export interface Question {
  id?: string;
  question: string;
  options: string[];
  answer: number; // 0, 1, 2, or 3
  explanation?: string;
  imageUrl?: string;
  audioHint?: string;
  topic?: string;
}

export interface WordBuildItem {
  id: string;
  word: string;
  hint: string;
  scrambled: string[];
  level: CefrLevel;
  topic: string;
  meaning: string;
}

export interface GameSettings {
  category: CategoryId;
  level: CefrLevel;
  topic: string;
  count: number | 'random';
}

export interface PlayerResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpentSeconds: number;
  category: CategoryId;
  level: CefrLevel;
  topic: string;
  date: string;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedOption?: number;
  isCorrect?: boolean;
  answerTimeMs?: number;
}

export interface MultiplayerRoomState {
  roomId: string;
  hostId: string;
  state: 'lobby' | 'question' | 'reveal' | 'finished';
  settings: GameSettings;
  questions: Question[];
  currentQuestionIndex: number;
  questionTimeLimit: number;
  timeRemaining: number;
  players: MultiplayerPlayer[];
}

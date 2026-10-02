import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { CATEGORIES, CEFR_LEVELS, QUESTION_COUNTS } from '../data/fallbackQuestions';
import { CategoryId, CefrLevel, GameSettings } from '../types/quiz';
import { sound } from '../utils/sound';

interface SoloSelectionProps {
  onBackToHome: () => void;
  onStartQuiz: (settings: GameSettings) => void;
  initialCategory?: CategoryId;
}

export const SoloSelection: React.FC<SoloSelectionProps> = ({
  onBackToHome,
  onStartQuiz,
  initialCategory,
}) => {
  // 1: Category, 2: Level, 3: Topic, 4: Count
  const [step, setStep] = useState<number>(initialCategory ? 2 : 1);
  const [category, setCategory] = useState<CategoryId>(initialCategory || 'vocabulary');
  const [level, setLevel] = useState<CefrLevel>('B1');
  const [topic, setTopic] = useState<string>('General');

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSelectCategory = (catId: CategoryId) => {
    sound.playClick();
    setCategory(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.topics.length > 0) {
      setTopic(cat.topics[0]);
    }
    setStep(2);
  };

  const handleSelectLevel = (lvl: CefrLevel) => {
    sound.playClick();
    setLevel(lvl);
    setStep(3);
  };

  const handleSelectTopic = (top: string) => {
    sound.playClick();
    setTopic(top);
    setStep(4);
  };

  const handleSelectCount = (cnt: number | 'random') => {
    sound.playClick();
    onStartQuiz({
      category,
      level,
      topic: topic || selectedCategoryObj.topics[0] || 'General',
      count: cnt,
    });
  };

  const handleBack = () => {
    sound.playClick();
    if (step === 1) {
      onBackToHome();
    } else if (step === 2) {
      if (initialCategory) {
        onBackToHome();
      } else {
        setStep(1);
      }
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-semibold text-sm cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-yellow-400'
                  : s < step
                  ? 'w-2.5 bg-emerald-400'
                  : 'w-2.5 bg-purple-900/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: CATEGORY */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
              Choose a Category
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="group p-5 sm:p-6 rounded-3xl bg-purple-950/80 hover:bg-purple-900/90 border-2 border-purple-700/60 hover:border-yellow-400 text-center cursor-pointer transition-all duration-150 shadow-lg hover:-translate-y-1 active:translate-y-1 flex flex-col items-center justify-center gap-2"
              >
                <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="font-fun text-lg sm:text-xl font-extrabold text-white group-hover:text-yellow-300 transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: CEFR LEVEL */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
              Choose your level
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
            {CEFR_LEVELS.map((lvl) => (
              <button
                key={lvl.level}
                onClick={() => handleSelectLevel(lvl.level)}
                className="group p-5 sm:p-6 rounded-3xl bg-purple-950/80 hover:bg-purple-900/90 border-2 border-purple-700/60 hover:border-yellow-400 text-center cursor-pointer transition-all duration-150 shadow-lg hover:-translate-y-1 active:translate-y-1 flex flex-col items-center justify-center gap-2"
              >
                <div className={`px-4 py-1.5 rounded-xl font-fun font-black text-2xl text-white shadow-md ${lvl.color}`}>
                  {lvl.level}
                </div>
                <span className="font-fun text-base sm:text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {lvl.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: TOPIC */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
              Choose a Topic
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {selectedCategoryObj.topics.map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTopic(t)}
                className="p-5 sm:p-6 rounded-3xl bg-purple-950/80 hover:bg-purple-900/90 border-2 border-purple-700/60 hover:border-yellow-400 text-center cursor-pointer transition-all duration-150 shadow-lg hover:-translate-y-1 active:translate-y-1 flex items-center justify-center"
              >
                <span className="font-fun text-lg sm:text-xl font-extrabold text-white hover:text-yellow-300">
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: QUESTION COUNT */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-fun text-3xl sm:text-4xl font-extrabold text-white">
              How many questions?
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 max-w-xl mx-auto">
            {QUESTION_COUNTS.map((cnt) => (
              <button
                key={String(cnt)}
                onClick={() => handleSelectCount(cnt === 'Random' ? 'random' : (cnt as number))}
                className="p-6 rounded-3xl bg-purple-950/80 hover:bg-purple-900/90 border-2 border-purple-700/60 hover:border-yellow-400 text-center cursor-pointer transition-all duration-150 shadow-lg hover:-translate-y-1 active:translate-y-1 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
                  {cnt === 'Random' ? (
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <span className="font-fun text-2xl font-black text-yellow-300">
                      {cnt}
                    </span>
                  )}
                </div>
                <span className="font-fun text-lg sm:text-xl font-extrabold text-white">
                  {cnt === 'Random' ? 'Random' : `${cnt} Questions`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

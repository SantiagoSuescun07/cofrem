"use client";

import { useState, useEffect, useRef } from "react";
import WordGrid from "./WordGrid";
import GameInstructions from "./GameInstructions";
import { GameConfig } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";

interface FoundWordData {
  word: string;
  positions: { row: number; col: number }[];
  color: string;
}

const WORD_COLORS = [
  "#306393",
  "#4a7ba7",
  "#5a8bb5",
  "#6b9bc3",
  "#7cabd1",
  "#8dbbdf",
  "#9ecbed",
  "#afdbfb",
  "#c0e5ff",
  "#d1efff",
  "#e2f5ff",
  "#f3fbff",
];

interface WordSearchGameProps {
  config: GameConfig;
  onClose: () => void;
  campaignNid?: number;
}

export default function WordSearchGame({
  config,
  onClose,
  campaignNid,
}: WordSearchGameProps) {
  const [foundWordsSet, setFoundWordsSet] = useState<Set<string>>(new Set());
  const [foundWordsData, setFoundWordsData] = useState<FoundWordData[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [currentWords, setCurrentWords] = useState<string[]>(config.words);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentWords(config.words);
  }, [config.words]);

  useEffect(() => {
    if (config.timeLimit > 0 && timeLeft > 0 && isGameActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsGameActive(false);
            setShowWarning(false);
            return 0;
          }
          if (prev === 31) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config.timeLimit, timeLeft, isGameActive]);

  const handleWordFound = async (
    word: string,
    positions: { row: number; col: number }[]
  ) => {
    if (!isGameActive) return;

    if (!foundWordsSet.has(word)) {
      const color = WORD_COLORS[foundWordsData.length % WORD_COLORS.length];
      const newFoundSet = new Set(foundWordsSet);
      newFoundSet.add(word);

      setFoundWordsSet(newFoundSet);
      const newFoundData = [...foundWordsData, { word, positions, color }];

      setFoundWordsData(newFoundData);
      setPoints((prev) => prev + config.pointsPerWord);

      if (newFoundSet.size === config.words.length) {
        setIsGameActive(false);
        
        // Actualizar ranking si se completó el juego y hay un nid de campaña
        // Manejo silencioso del error - el juego continúa funcionando incluso si falla
        if (campaignNid && config.gameId && !rankingUpdated) {
          setRankingUpdated(true);
          updateRanking(campaignNid, config.gameId).catch((error) => {
            // Error silencioso - solo se registra en consola, no interrumpe la experiencia
            console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
          });
        }
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Función para reiniciar el juego
  const handleRetry = () => {
    setFoundWordsSet(new Set());
    setFoundWordsData([]);
    setPoints(0);
    setTimeLeft(config.timeLimit);
    setCurrentWords(config.words);
    setIsGameActive(true);
    setShowWarning(false);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getCompletionMessage = () => {
    if (foundWordsSet.size === config.words.length) {
      return {
        title: "¡Increíble! Has completado el juego",
        message: "¡Eres un maestro de las palabras!",
        color: "#306393",
      };
    } else {
      return {
        title: "¡Tiempo terminado!",
        message: `Encontraste ${foundWordsSet.size} de ${config.words.length} palabras`,
        color: "#306393",
      };
    }
  };

  const completionData = getCompletionMessage();

  // gridSize ya viene como número del config
  const gridSize = config.gridSize;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full">
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[2000] bg-yellow-400 text-yellow-900 text-center py-3 px-4 rounded-b-2xl animate-bounce shadow-lg">
          ¡Atención! Quedan solo <strong>30 segundos</strong> para encontrar más
          palabras. ¡Dale con todo! 🚀
        </div>
      )}

      {/* Encabezado */}
      <div
        className={`flex justify-between items-center mb-8 p-6 bg-white rounded-2xl border border-[#306393] shadow-lg ${
          showWarning ? "mt-16" : "mt-0"
        }`}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#306393] to-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            🎯
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#306393] to-blue-400 bg-clip-text text-transparent">
              {config.title}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          {config.timeLimit > 0 && (
            <div
              className={`text-xl font-bold px-4 py-2 rounded-2xl border-2 ${
                timeLeft <= 30
                  ? "text-red-600 bg-red-50 border-red-500 animate-pulse"
                  : timeLeft <= 60
                  ? "text-yellow-600 bg-yellow-50 border-yellow-500"
                  : "text-[#306393] bg-blue-50 border-[#306393]"
              }`}
            >
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-xl font-bold text-[#306393] bg-blue-50 px-4 py-2 rounded-2xl border-2 border-dashed border-[#306393]">
            🌟 {points}
          </div>
        </div>
      </div>

      <GameInstructions text={config.description} />

      {!isGameActive ? (
        <div className="mt-8 p-12 bg-gradient-to-br from-white to-blue-50 rounded-3xl text-center shadow-xl border-4 border-[#306393] max-w-2xl mx-auto animate-fade-in">
          <div className="text-6xl mb-4 opacity-20 absolute top-4 right-4">
            🎉
          </div>
          <h2
            className="text-4xl font-bold mb-6"
            style={{ color: completionData.color }}
          >
            {completionData.title}
          </h2>
          <p className="text-xl text-gray-700 mb-8 font-medium">
            {completionData.message}
          </p>
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#306393]">
              <div className="text-sm text-gray-600 mb-2">Puntaje Final</div>
              <div className="text-3xl font-bold text-[#306393]">{points}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#306393]">
              <div className="text-sm text-gray-600 mb-2">
                Palabras Encontradas
              </div>
              <div className="text-3xl font-bold text-[#306393]">
                {foundWordsSet.size}
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-to-r from-[#306393] to-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              🔄 Jugar de Nuevo
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-gray-600 transition-all duration-200"
            >
              ← Volver a la Campaña
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-8 flex-wrap justify-center mt-4">
          <div className="flex-1 min-w-[320px] max-w-[650px]">
            {currentWords.length > 0 ? (
              <WordGrid
                words={currentWords}
                gridSize={gridSize}
                directions={config.directions}
                onWordFound={handleWordFound}
                foundWordsData={foundWordsData}
                difficulty={config.difficulty}
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-4 min-w-[280px] self-start mt-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#306393] text-xl font-bold mb-2">
                Palabras a encontrar:
              </h3>
              {currentWords.map((word) => (
                <span
                  key={word}
                  className={`text-lg font-semibold px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    foundWordsSet.has(word)
                      ? "line-through text-gray-500 bg-green-100 border-green-400 shadow-md"
                      : "text-gray-800 bg-white border-blue-200"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {isGameActive && (
        <div className="text-center mt-8 mb-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-[#306393] to-blue-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Volver a la Campaña
          </button>
        </div>
      )}

      {/* Confeti de celebración */}
      {!isGameActive && foundWordsSet.size === config.words.length && (
        <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[1000] overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${10 + Math.random() * 10}px`,
                height: `${10 + Math.random() * 10}px`,
                backgroundColor:
                  WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


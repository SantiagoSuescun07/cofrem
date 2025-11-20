"use client";

import { useState, useEffect, useRef } from "react";
import { CompletePhraseGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import GameInstructions from "./GameInstructions";

interface CompletePhraseGameProps {
  gameDetails: CompletePhraseGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

export default function CompletePhraseGame({
  gameDetails,
  onClose,
  campaignNid,
}: CompletePhraseGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(
    gameDetails.field_time_limit || 0
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mezclar las opciones de respuesta
  const answers = [
    gameDetails.field_correct_answer,
    gameDetails.field_incorrect_answer_1,
    gameDetails.field_incorrect_answer_2,
  ].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (
      gameDetails.field_time_limit &&
      gameDetails.field_time_limit > 0 &&
      timeLeft > 0 &&
      isGameActive &&
      !isAnswered
    ) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameDetails.field_time_limit, timeLeft, isGameActive, isAnswered]);

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered || !isGameActive) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setIsGameActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const correct =
      answer.toLowerCase().trim() ===
      gameDetails.field_correct_answer.toLowerCase().trim();
    setIsCorrect(correct);

    if (correct) {
      setPoints(gameDetails.field_points || 0);

      // Actualizar ranking si la respuesta es correcta
      // Manejo silencioso del error - el juego continúa funcionando incluso si falla
      if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
        setRankingUpdated(true);
        updateRanking(campaignNid, gameDetails.drupal_internal__id).catch(
          (error) => {
            // Error silencioso - solo se registra en consola, no interrumpe la experiencia
            console.warn(
              "No se pudo actualizar el ranking (esto no afecta tu puntuación):",
              error
            );
          }
        );
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
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setPoints(0);
    setTimeLeft(gameDetails.field_time_limit || 0);
    setIsGameActive(true);
    setShowHint(false);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Extraer el placeholder de la frase
  const getPlaceholderPosition = () => {
    const phrase = gameDetails.field_phrase_to_complete;
    const placeholderMatch = phrase.match(/_+/);
    if (placeholderMatch) {
      const placeholder = placeholderMatch[0];
      const parts = phrase.split(placeholder);
      return { before: parts[0], after: parts[1] || "" };
    }
    return { before: phrase, after: "" };
  };

  const { before, after } = getPlaceholderPosition();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl border border-[#9b59b6] shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9b59b6] to-purple-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            📝
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b59b6] to-purple-400 bg-clip-text text-transparent">
              {gameDetails.field_title}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 items-center">
        
          {isAnswered && (
            <div className="text-xl font-bold text-[#9b59b6] bg-purple-50 px-4 py-2 rounded-2xl border-2 border-dashed border-[#9b59b6]">
              🌟 {points}
            </div>
          )}
        </div>
      </div>

      {gameDetails.field_description && (
        <GameInstructions text={gameDetails.field_description} />
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#9b59b6] shadow-xl p-8 max-w-3xl w-full">
          {/* Frase a completar */}
          <div className="mb-8">
            <div className="text-2xl md:text-3xl font-semibold text-gray-800 text-center leading-relaxed">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span>{before.trim()}</span>
                <span className="inline-block px-6 py-3 bg-purple-100 border-2 border-dashed border-purple-400 rounded-xl min-w-[150px] text-center shadow-md">
                  {isAnswered && isCorrect ? (
                    <span className="text-purple-700 font-bold text-xl">
                      {gameDetails.field_correct_answer}
                    </span>
                  ) : isAnswered && !isCorrect && selectedAnswer ? (
                    <div className="space-y-1">
                      <span className="text-red-500 line-through block text-lg">
                        {selectedAnswer}
                      </span>
                      <span className="text-purple-700 font-bold block text-xl border-t border-purple-300 pt-1">
                        {gameDetails.field_correct_answer}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-lg font-mono">
                      ____
                    </span>
                  )}
                </span>
                {after && after.trim() && <span>{after.trim()}</span>}
              </div>
              {!isAnswered && (
                <p className="text-sm text-gray-500 mt-2">
                  👆 Selecciona la palabra que completa la frase de arriba
                </p>
              )}
            </div>
          </div>

          {/* Opciones de respuesta */}
          {!isAnswered && (
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Selecciona la palabra correcta:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(answer)}
                    className="px-6 py-4 bg-gradient-to-r from-[#9b59b6] to-purple-500 text-white rounded-xl text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultado */}
          {isAnswered && (
            <div className="text-center mb-6">
              {isCorrect ? (
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-4">
                  <div className="text-5xl mb-2">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    ¡Correcto!
                  </h3>
                  <p className="text-green-600">Has ganado {points} puntos</p>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
                  <div className="text-5xl mb-2">❌</div>
                  <h3 className="text-2xl font-bold text-red-700 mb-2">
                    Incorrecto
                  </h3>
                  <p className="text-red-600 mb-4">
                    La respuesta correcta era:{" "}
                    <strong>{gameDetails.field_correct_answer}</strong>
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#9b59b6] to-purple-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    🔄 Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pista */}
          {gameDetails.field_hint && (
            <div className="mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="w-full px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                {showHint ? "Ocultar" : "Mostrar"} pista 💡
              </button>
              {showHint && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>Pista:</strong> {gameDetails.field_hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botón para volver */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-[#9b59b6] to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              ← Volver a la Campaña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

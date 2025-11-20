"use client";

import { useState, useEffect, useRef } from "react";
import { EmojiDiscoveryGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import GameInstructions from "./GameInstructions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmojiDiscoveryGameProps {
  gameDetails: EmojiDiscoveryGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

export default function EmojiDiscoveryGame({
  gameDetails,
  onClose,
  campaignNid,
}: EmojiDiscoveryGameProps) {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDetails.field_time_limit || 0);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && timeLeft > 0 && isGameActive && !isAnswered) {
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

  const handleSubmit = async () => {
    if (!userAnswer.trim() || isAnswered || !isGameActive) return;

    setIsAnswered(true);
    setIsGameActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Por ahora, cualquier respuesta da puntos. Más adelante se puede validar con una respuesta esperada
    const correct = userAnswer.trim().length > 0;
    setIsCorrect(correct);

    if (correct) {
      setPoints(gameDetails.field_points || 0);
      
      // Actualizar ranking si la respuesta es correcta
      // Manejo silencioso del error - el juego continúa funcionando incluso si falla
      if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
        setRankingUpdated(true);
        updateRanking(campaignNid, gameDetails.drupal_internal__id).catch((error) => {
          // Error silencioso - solo se registra en consola, no interrumpe la experiencia
          console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
        });
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
    setUserAnswer("");
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

  // Extraer emojis del título (el título contiene los emojis)
  const emojis = gameDetails.field_title.match(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || [];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl border border-[#f39c12] shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#f39c12] to-orange-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            😀
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f39c12] to-orange-400 bg-clip-text text-transparent">
              {gameDetails.field_title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "") || "Descubrir Emoji"}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          {gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && (
            <div
              className={`text-xl font-bold px-4 py-2 rounded-2xl border-2 ${
                timeLeft <= 10
                  ? "text-red-600 bg-red-50 border-red-500 animate-pulse"
                  : timeLeft <= 30
                  ? "text-yellow-600 bg-yellow-50 border-yellow-500"
                  : "text-[#f39c12] bg-orange-50 border-[#f39c12]"
              }`}
            >
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          {isAnswered && (
            <div className="text-xl font-bold text-[#f39c12] bg-orange-50 px-4 py-2 rounded-2xl border-2 border-dashed border-[#f39c12]">
              🌟 {points}
            </div>
          )}
        </div>
      </div>

      {gameDetails.field_description && (
        <GameInstructions text={gameDetails.field_description} />
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#f39c12] shadow-xl p-8 max-w-3xl w-full">
          {/* Emojis a descubrir */}
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">
              ¿Qué palabra representan estos emojis?
            </h3>
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              {emojis.length > 0 ? (
                emojis.map((emoji, index) => (
                  <div
                    key={index}
                    className="text-6xl md:text-7xl p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
                  >
                    {emoji}
                  </div>
                ))
              ) : (
                <div className="text-6xl md:text-7xl p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                  {gameDetails.field_title}
                </div>
              )}
            </div>
          </div>

          {/* Input de respuesta */}
          {!isAnswered && (
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Escribe la palabra que crees que representan estos emojis..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                className="text-lg px-4 py-3 border-2 border-[#f39c12] rounded-xl focus:ring-2 focus:ring-[#f39c12]"
              />
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full mt-4 bg-gradient-to-r from-[#f39c12] to-orange-500 text-white rounded-xl text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Respuesta
              </Button>
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
                  <p className="text-green-600">
                    Tu respuesta: <strong>{userAnswer}</strong>
                  </p>
                  <p className="text-green-600 mt-2">
                    Has ganado {points} puntos
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
                  <div className="text-5xl mb-2">❌</div>
                  <h3 className="text-2xl font-bold text-red-700 mb-2">
                    Inténtalo de nuevo
                  </h3>
                  <p className="text-red-600 mb-4">
                    Tu respuesta: <strong>{userAnswer}</strong>
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#f39c12] to-orange-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
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
              className="px-8 py-4 bg-gradient-to-r from-[#f39c12] to-orange-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              ← Volver a la Campaña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useRef } from "react";
import { EmojiDiscoveryGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import { InfoIcon } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e6fff2]/40 via-white to-[#e6fff2]/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Card unificada con header e instrucciones */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-[#09d6a6]/20 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#09d6a6] to-[#0bc9a0] rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  😊
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {gameDetails.field_title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "") || "Descubrir Emoji"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Descubrir Emoji</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                {gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && (
                  <div className="flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-2.5 shadow-sm">
                    <span className="text-lg">⏱️</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 leading-none">Tiempo</span>
                      <span
                        className={`text-lg font-bold leading-none ${
                          timeLeft <= 30
                            ? "text-red-600 animate-pulse"
                            : timeLeft <= 60
                            ? "text-orange-600"
                            : "text-[#09d6a6]"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-gradient-to-br from-[#e6fff2] to-white rounded-xl border-2 border-[#09d6a6] px-4 py-2.5 shadow-sm">
                  <span className="text-lg">🌟</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-none">Puntos</span>
                    <span className="text-lg font-bold text-[#09d6a6] leading-none">
                      {points}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Instrucciones */}
            {gameDetails.field_description && gameDetails.field_description.trim() !== "" && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#09d6a6] to-[#0bc9a0] rounded-lg flex items-center justify-center text-white shadow-md">
                  <InfoIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#09d6a6] mb-1.5">
                    Instrucciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{gameDetails.field_description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal del juego */}
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="bg-white rounded-2xl border-2 border-[#09d6a6]/30 shadow-xl p-6 sm:p-8 max-w-4xl w-full">
            {/* Emojis a descubrir - Mejorado */}
            <div className="mb-8 text-center">
              <div className="bg-gradient-to-br from-[#e6fff2]/50 to-white rounded-xl p-6 sm:p-8 border border-[#09d6a6]/20 mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                  ¿Qué palabra representan estos emojis?
                </h3>
                <div className="flex justify-center gap-4 sm:gap-6 flex-wrap">
                  {emojis.length > 0 ? (
                    emojis.map((emoji, index) => (
                      <div
                        key={index}
                        className="text-5xl sm:text-6xl md:text-7xl p-5 sm:p-6 bg-white rounded-xl border-2 border-[#09d6a6] shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                      >
                        {emoji}
                      </div>
                    ))
                  ) : (
                    <div className="text-5xl sm:text-6xl md:text-7xl p-5 sm:p-6 bg-white rounded-xl border-2 border-[#09d6a6] shadow-lg">
                      {gameDetails.field_title}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input de respuesta - Mejorado */}
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
                  className="text-base sm:text-lg px-5 py-4 border-2 border-[#09d6a6] rounded-xl focus:ring-2 focus:ring-[#09d6a6] focus:border-[#09d6a6] mb-4"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-gradient-to-r from-[#09d6a6] to-[#0bc9a0] text-white rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:from-[#0bc9a0] hover:to-[#0dbc9a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed py-6"
                >
                  Enviar Respuesta
                </Button>
              </div>
            )}

            {/* Resultado - Mejorado */}
            {isAnswered && (
              <div className="text-center mb-6">
                {isCorrect ? (
                  <div className="bg-gradient-to-br from-[#e6fff2] to-white border-2 border-[#09d6a6] rounded-xl p-8 mb-4 shadow-lg">
                    <div className="text-6xl mb-3">🎉</div>
                    <h3 className="text-3xl font-bold text-[#09d6a6] mb-3">
                      ¡Correcto!
                    </h3>
                    <p className="text-lg text-gray-700 mb-2">
                      Tu respuesta: <strong className="text-[#09d6a6]">{userAnswer}</strong>
                    </p>
                    <p className="text-lg text-gray-700 mb-6">
                      Has ganado <strong className="text-[#09d6a6] text-xl">{points}</strong> puntos
                    </p>
                    <div className="flex gap-4 justify-center mt-6">
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-gradient-to-r from-[#09d6a6] to-[#0bc9a0] text-white rounded-xl text-base font-semibold shadow-lg hover:from-[#0bc9a0] hover:to-[#0dbc9a] transition-all duration-200 transform hover:scale-105"
                      >
                        🔄 Jugar de Nuevo
                      </button>
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white text-gray-700 rounded-xl text-base font-medium hover:bg-[#e4fef1] transition-all duration-200 border-2 border-gray-200 shadow-sm"
                      >
                        ← Volver
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-400 rounded-xl p-8 mb-4 shadow-lg">
                    <div className="text-6xl mb-3">❌</div>
                    <h3 className="text-3xl font-bold text-red-700 mb-3">
                      Inténtalo de nuevo
                    </h3>
                    <p className="text-lg text-red-600 mb-6">
                      Tu respuesta: <strong>{userAnswer}</strong>
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-gradient-to-r from-[#09d6a6] to-[#0bc9a0] text-white rounded-xl text-base font-semibold shadow-lg hover:from-[#0bc9a0] hover:to-[#0dbc9a] transition-all duration-200 transform hover:scale-105"
                      >
                        🔄 Reintentar
                      </button>
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white text-gray-700 rounded-xl text-base font-medium hover:bg-[#e4fef1] transition-all duration-200 border-2 border-gray-200 shadow-sm"
                      >
                        ← Volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pista - Mejorado */}
            {gameDetails.field_hint && !isAnswered && (
              <div className="mb-6">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="w-full px-4 py-3 bg-gradient-to-br from-[#e6fff2] to-white border-2 border-[#09d6a6]/50 text-[#09d6a6] rounded-lg hover:bg-[#e6fff2] transition-colors font-medium shadow-sm"
                >
                  {showHint ? "Ocultar" : "Mostrar"} pista 💡
                </button>
                {showHint && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-[#e6fff2] to-white border-2 border-[#09d6a6]/30 rounded-lg shadow-sm">
                    <p className="text-gray-800 text-base">
                      <strong className="text-[#09d6a6]">Pista:</strong> {gameDetails.field_hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botón para volver - Solo si no hay respuesta */}
            {!isAnswered && (
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="px-6 sm:px-8 py-3 bg-white text-gray-700 rounded-xl text-base sm:text-lg font-medium hover:bg-[#e4fef1] transition-all duration-200 border-2 border-gray-200 shadow-sm"
                >
                  ← Volver a la Campaña
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


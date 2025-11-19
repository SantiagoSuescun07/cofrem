"use client";

import { useState, useEffect, useRef } from "react";
import { QuizGameDetails, QuizQuestion } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import GameInstructions from "./GameInstructions";

interface QuizGameProps {
  gameDetails: QuizGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

export default function QuizGame({
  gameDetails,
  onClose,
  campaignNid,
}: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDetails.field_time_limit || 0);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const questions = gameDetails.field_quiz_questions || [];
  const currentQuestion: QuizQuestion | null = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;
  const isGameComplete = currentQuestionIndex >= totalQuestions;

  useEffect(() => {
    if (gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && timeLeft > 0 && isGameActive && !isGameComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsGameActive(false);
            // Avanzar a la siguiente pregunta cuando se acaba el tiempo
            if (currentQuestionIndex < totalQuestions - 1) {
              setTimeout(() => {
                handleNextQuestion();
              }, 1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameDetails.field_time_limit, timeLeft, isGameActive, currentQuestionIndex, totalQuestions, isGameComplete]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered || !isGameActive || !currentQuestion) return;

    setSelectedOption(option);
    setIsAnswered(true);
    setIsGameActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const correctOption = `field_option_${currentQuestion.field_correct_option}`;
    const isCorrect = option === (currentQuestion as any)[correctOption];

    // Avanzar a la siguiente pregunta después de 2 segundos
    setTimeout(() => {
      const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
      
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }

      if (currentQuestionIndex < totalQuestions - 1) {
        handleNextQuestion();
      } else {
        // Juego completado
        const pointsPerQuestion = gameDetails.field_points 
          ? Math.floor(gameDetails.field_points / totalQuestions)
          : 0;
        const finalPoints = newCorrectAnswers * pointsPerQuestion;
        setPoints(finalPoints);

        // Actualizar ranking si se completa el juego
        if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
          setRankingUpdated(true);
          updateRanking(campaignNid, gameDetails.drupal_internal__id).catch((error) => {
            console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
          });
        }
      }
    }, 2000);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setIsGameActive(true);
    
    // Reiniciar el temporizador si hay tiempo límite por pregunta
    if (gameDetails.field_time_limit && gameDetails.field_time_limit > 0) {
      setTimeLeft(gameDetails.field_time_limit);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Función para reiniciar el juego
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setPoints(0);
    setTimeLeft(gameDetails.field_time_limit || 0);
    setIsGameActive(true);
    setShowHint(false);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getOptionLabel = (optionNumber: number): string => {
    const labels = ["A", "B", "C", "D"];
    return labels[optionNumber - 1] || "";
  };

  if (!currentQuestion && !isGameComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-red-400 shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-6">No hay preguntas disponibles para este quiz.</p>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-gradient-to-r from-[#306393] to-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            ← Volver a la Campaña
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl border border-[#306393] shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#306393] to-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            📝
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#306393] to-blue-400 bg-clip-text text-transparent">
              {gameDetails.field_title}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          {gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && !isGameComplete && (
            <div
              className={`text-xl font-bold px-4 py-2 rounded-2xl border-2 ${
                timeLeft <= 10
                  ? "text-red-600 bg-red-50 border-red-500 animate-pulse"
                  : timeLeft <= 30
                  ? "text-yellow-600 bg-yellow-50 border-yellow-500"
                  : "text-[#306393] bg-blue-50 border-[#306393]"
              }`}
            >
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-xl font-bold text-[#306393] bg-blue-50 px-4 py-2 rounded-2xl border-2 border-dashed border-[#306393]">
            📊 {currentQuestionIndex + 1}/{totalQuestions}
          </div>
          {isGameComplete && (
            <div className="text-xl font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl border-2 border-dashed border-purple-400">
              🌟 {points}
            </div>
          )}
        </div>
      </div>

      {gameDetails.field_description && (
        <GameInstructions text={gameDetails.field_description} />
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#306393] shadow-xl p-8 max-w-4xl w-full">
          {isGameComplete ? (
            // Resultado final
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-xl p-8 mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-700 mb-4">
                  ¡Quiz Completado!
                </h2>
                <div className="space-y-3 text-lg">
                  <p className="text-gray-700">
                    <strong>Respuestas correctas:</strong> {correctAnswers} de {totalQuestions}
                  </p>
                  <p className="text-gray-700">
                    <strong>Porcentaje:</strong> {Math.round((correctAnswers / totalQuestions) * 100)}%
                  </p>
                  <p className="text-purple-600 font-bold text-xl mt-4">
                    Puntos obtenidos: {points}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gradient-to-r from-[#16a085] to-teal-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
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
          ) : currentQuestion ? (
            <>
              {/* Pregunta actual */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#306393] text-white px-4 py-2 rounded-lg font-bold text-lg">
                    Pregunta {currentQuestion.field_question_number || currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.field_hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                      {showHint ? "Ocultar" : "Mostrar"} pista 💡
                    </button>
                  )}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                  {currentQuestion.field_question_text}
                </h2>

                {showHint && currentQuestion.field_hint && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Pista:</strong> {currentQuestion.field_hint}
                    </p>
                  </div>
                )}

                {/* Opciones de respuesta */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((optionNum) => {
                    const optionKey = `field_option_${optionNum}` as keyof QuizQuestion;
                    const optionValue = currentQuestion[optionKey] as string;
                    if (!optionValue) return null;

                    const isSelected = selectedOption === optionValue;
                    const correctOption = `field_option_${currentQuestion.field_correct_option}` as keyof QuizQuestion;
                    const isCorrect = optionValue === (currentQuestion[correctOption] as string);
                    const showResult = isAnswered && isSelected;

                    return (
                      <button
                        key={optionNum}
                        onClick={() => handleOptionSelect(optionValue)}
                        disabled={isAnswered || !isGameActive}
                        className={`
                          w-full px-6 py-4 rounded-xl text-left transition-all duration-200 transform
                          ${isAnswered
                            ? isSelected && isCorrect
                              ? "bg-green-100 border-2 border-green-500 scale-105"
                              : isSelected && !isCorrect
                              ? "bg-red-100 border-2 border-red-500"
                              : isCorrect
                              ? "bg-green-50 border-2 border-green-300"
                              : "bg-gray-100 border-2 border-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#306393] to-blue-500 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg cursor-pointer border-2 border-transparent"
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <span className="bg-white text-[#306393] px-4 py-2 rounded-lg font-bold text-lg min-w-[50px] text-center">
                            {getOptionLabel(optionNum)}
                          </span>
                          <span className="text-lg font-semibold flex-1">{optionValue}</span>
                          {showResult && (
                            <span className="text-2xl">
                              {isCorrect ? "✅" : "❌"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Indicador de progreso */}
              <div className="mt-8">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#306393] to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
                <p className="text-center text-gray-600 mt-2">
                  Progreso: {currentQuestionIndex + 1} de {totalQuestions} preguntas
                </p>
              </div>
            </>
          ) : null}

          {/* Botón para volver */}
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-[#306393] to-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              ← Volver a la Campaña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


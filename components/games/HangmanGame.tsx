"use client";

import { useState, useEffect, useRef } from "react";
import { HangmanGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import GameInstructions from "./GameInstructions";

interface HangmanGameProps {
  gameDetails: HangmanGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

const MAX_ERRORS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Función para normalizar letras (quitar acentos para comparación)
const normalizeLetter = (char: string): string => {
  return char
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

// Función para verificar si una letra está en la palabra (ignorando acentos)
const isLetterInWord = (letter: string, word: string): boolean => {
  const normalizedLetter = normalizeLetter(letter);
  return word.split("").some((char) => normalizeLetter(char) === normalizedLetter);
};

// Función para obtener todas las variantes de una letra en la palabra
const getLetterVariants = (letter: string, word: string): string[] => {
  const normalizedLetter = normalizeLetter(letter);
  return word
    .split("")
    .filter((char) => normalizeLetter(char) === normalizedLetter && /[A-ZÑÁÉÍÓÚÜ]/.test(char))
    .filter((char, index, arr) => arr.indexOf(char) === index); // Eliminar duplicados
};

export default function HangmanGame({
  gameDetails,
  onClose,
  campaignNid,
}: HangmanGameProps) {
  const word = gameDetails.field_words_phrases.toUpperCase().trim();
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [isGameLost, setIsGameLost] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  // Cronómetro siempre de 60 segundos
  const INITIAL_TIME = 60;
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar si todas las letras han sido adivinadas (comparando letras normalizadas)
  const allLettersGuessed = word
    .split("")
    .filter((char) => /[A-ZÑÁÉÍÓÚÜ]/.test(char))
    .every((char) => {
      const normalizedChar = normalizeLetter(char);
      return Array.from(guessedLetters).some((guessed) => normalizeLetter(guessed) === normalizedChar);
    });

  // Verificar si el juego ha terminado
  useEffect(() => {
    if (allLettersGuessed && errors < MAX_ERRORS && !isGameWon) {
      setIsGameWon(true);
      setIsGameActive(false);
      setPoints(gameDetails.field_points || 0);

      // Actualizar ranking si el juego se completa correctamente
      if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
        setRankingUpdated(true);
        updateRanking(campaignNid, gameDetails.drupal_internal__id).catch((error) => {
          console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
        });
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else if (errors >= MAX_ERRORS && !isGameLost) {
      setIsGameLost(true);
      setIsGameActive(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [allLettersGuessed, errors, isGameWon, isGameLost, gameDetails.field_points, campaignNid, rankingUpdated]);

  // Cronómetro siempre activo de 60 segundos
  useEffect(() => {
    if (timeLeft > 0 && isGameActive && !isGameWon && !isGameLost) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsGameActive(false);
            setIsGameLost(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeLeft, isGameActive, isGameWon, isGameLost]);

  const handleLetterClick = (letter: string) => {
    if (!isGameActive || guessedLetters.has(letter) || isGameWon || isGameLost) {
      return;
    }

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    
    // Agregar todas las variantes de la letra (con acentos) si están en la palabra
    const variants = getLetterVariants(letter, word);
    variants.forEach((variant) => newGuessedLetters.add(variant));
    
    setGuessedLetters(newGuessedLetters);

    // Si la letra no está en la palabra (comparando normalizada), incrementar errores
    if (!isLetterInWord(letter, word)) {
      setErrors((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Función para reiniciar el juego
  const handleRetry = () => {
    setGuessedLetters(new Set());
    setErrors(0);
    setIsGameWon(false);
    setIsGameLost(false);
    setPoints(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameActive(true);
    setShowHint(false);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Renderizar la palabra con espacios y letras adivinadas
  const renderWord = () => {
    return word.split("").map((char, index) => {
      if (char === " ") {
        return <span key={index} className="mx-2" />;
      } else if (!/[A-ZÑÁÉÍÓÚÜ]/.test(char)) {
        return <span key={index} className="text-4xl font-bold text-gray-800 mx-1">{char}</span>;
      } else {
        // Verificar si la letra (o su versión normalizada) ha sido adivinada
        const normalizedChar = normalizeLetter(char);
        const isGuessed = Array.from(guessedLetters).some(
          (guessed) => normalizeLetter(guessed) === normalizedChar
        );
        return (
          <span
            key={index}
            className={`text-5xl font-bold mx-2 min-w-[40px] inline-block text-center border-b-4 ${
              isGuessed
                ? "text-[#306393] border-[#306393]"
                : "text-transparent border-gray-400"
            }`}
          >
            {isGuessed ? char : " "}
          </span>
        );
      }
    });
  };

  // Renderizar el dibujo del ahorcado
  const renderHangman = () => {
    const parts = [
      errors >= 1, // Cabeza
      errors >= 2, // Cuerpo
      errors >= 3, // Brazo izquierdo
      errors >= 4, // Brazo derecho
      errors >= 5, // Pierna izquierda
      errors >= 6, // Pierna derecha
    ];

    return (
      <div className="relative w-48 h-64 mx-auto mb-6">
        {/* Soporte */}
        <svg className="w-full h-full" viewBox="0 0 200 300">
          {/* Base */}
          <line x1="20" y1="280" x2="80" y2="280" stroke="#8B4513" strokeWidth="6" />
          {/* Poste vertical */}
          <line x1="50" y1="280" x2="50" y2="20" stroke="#8B4513" strokeWidth="6" />
          {/* Travesaño superior */}
          <line x1="50" y1="20" x2="150" y2="20" stroke="#8B4513" strokeWidth="6" />
          {/* Cuerda */}
          <line x1="150" y1="20" x2="150" y2="50" stroke="#654321" strokeWidth="4" />
          
          {/* Cabeza */}
          {parts[0] && (
            <circle cx="150" cy="70" r="20" stroke="#000" strokeWidth="3" fill="none" />
          )}
          
          {/* Cuerpo */}
          {parts[1] && (
            <line x1="150" y1="90" x2="150" y2="180" stroke="#000" strokeWidth="4" />
          )}
          
          {/* Brazo izquierdo */}
          {parts[2] && (
            <line x1="150" y1="120" x2="120" y2="150" stroke="#000" strokeWidth="4" />
          )}
          
          {/* Brazo derecho */}
          {parts[3] && (
            <line x1="150" y1="120" x2="180" y2="150" stroke="#000" strokeWidth="4" />
          )}
          
          {/* Pierna izquierda */}
          {parts[4] && (
            <line x1="150" y1="180" x2="120" y2="220" stroke="#000" strokeWidth="4" />
          )}
          
          {/* Pierna derecha */}
          {parts[5] && (
            <line x1="150" y1="180" x2="180" y2="220" stroke="#000" strokeWidth="4" />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl border border-[#306393] shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#306393] to-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            🎯
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#306393] to-blue-400 bg-clip-text text-transparent">
              {gameDetails.field_title}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          {/* Cronómetro siempre visible de 60 segundos */}
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
          <div className={`text-xl font-bold px-4 py-2 rounded-2xl border-2 ${
            isGameWon && points > 0
              ? "text-[#306393] bg-blue-50 border-[#306393] border-dashed"
              : "text-gray-400 bg-gray-50 border-gray-300"
          }`}>
            🌟 {points}
          </div>
          <div className="text-lg font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-2xl border-2 border-red-300">
            ❌ {errors}/{MAX_ERRORS}
          </div>
        </div>
      </div>

      {gameDetails.field_description && (
        <GameInstructions text={gameDetails.field_description} />
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#306393] shadow-xl p-8 max-w-4xl w-full">
          {/* Dibujo del ahorcado */}
          {renderHangman()}

          {/* Palabra a adivinar */}
          <div className="mb-8 text-center">
            <div className="flex flex-wrap items-center justify-center min-h-[80px]">
              {renderWord()}
            </div>
          </div>

          {/* Resultado del juego */}
          {isGameWon && (
            <div className="text-center mb-6">
              <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-4">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  ¡Felicidades!
                </h3>
                <p className="text-green-600 mb-2">
                  Has adivinado la palabra: <strong>{word}</strong>
                </p>
                <p className="text-green-600">
                  Has ganado {points} puntos
                </p>
              </div>
            </div>
          )}

          {isGameLost && (
            <div className="text-center mb-6">
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
                <div className="text-5xl mb-2">💀</div>
                <h3 className="text-2xl font-bold text-red-700 mb-2">
                  ¡Game Over!
                </h3>
                <p className="text-red-600 mb-2">
                  La palabra era: <strong>{word}</strong>
                </p>
                <p className="text-red-600 mb-4">
                  Has alcanzado el máximo de errores
                </p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gradient-to-r from-[#e74c3c] to-red-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Teclado de letras */}
          {!isGameWon && !isGameLost && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Selecciona una letra:
              </h3>
              <div className="grid grid-cols-7 md:grid-cols-9 lg:grid-cols-9 gap-2 max-w-3xl mx-auto">
                {ALPHABET.map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect = isLetterInWord(letter, word);
                  const isDisabled = isGuessed || !isGameActive;

                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      disabled={isDisabled}
                      className={`px-4 py-3 text-lg font-bold rounded-lg transition-all duration-200 ${
                        isGuessed && isCorrect
                          ? "bg-green-500 text-white cursor-default"
                          : isGuessed && !isCorrect
                          ? "bg-red-500 text-white cursor-default"
                          : isDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#306393] text-white hover:bg-blue-600 hover:scale-105 hover:shadow-lg"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
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


"use client";

import { useState, useEffect, useRef } from "react";
import { WordMatchGameDetails, WordMatchPair } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import GameInstructions from "./GameInstructions";
import Image from "next/image";

interface WordMatchGameProps {
  gameDetails: WordMatchGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

interface WordCard {
  id: string;
  text: string;
  pairId: string;
  type: "word";
}

interface ImageCard {
  id: string;
  imageUrl?: string;
  imageAlt?: string;
  pairId: string;
  type: "image";
}

export default function WordMatchGame({
  gameDetails,
  onClose,
  campaignNid,
}: WordMatchGameProps) {
  const [words, setWords] = useState<WordCard[]>([]);
  const [images, setImages] = useState<ImageCard[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDetails.field_time_limit || 0);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pairs = gameDetails.field_pairs || [];
  const totalPairs = pairs.length;

  // Inicializar palabras e imágenes
  useEffect(() => {
    if (pairs.length > 0) {
      const wordCards: WordCard[] = [];
      const imageCards: ImageCard[] = [];

      pairs.forEach((pair) => {
        const pairId = pair.id;
        
        // Agregar palabra
        wordCards.push({
          id: `word-${pairId}`,
          text: pair.field_associated_text,
          pairId: pairId,
          type: "word",
        });

        // Agregar imagen si existe
        if (pair.field_puzzle_image && pair.field_puzzle_image.length > 0) {
          const firstImage = pair.field_puzzle_image[0];
          imageCards.push({
            id: `image-${pairId}`,
            imageUrl: firstImage.url,
            imageAlt: firstImage.alt,
            pairId: pairId,
            type: "image",
          });
        }
      });

      // Mezclar las palabras e imágenes
      const shuffledWords = wordCards.sort(() => Math.random() - 0.5);
      const shuffledImages = imageCards.sort(() => Math.random() - 0.5);

      setWords(shuffledWords);
      setImages(shuffledImages);
    }
  }, [pairs]);

  // Manejar selección de palabra
  const handleWordClick = (wordId: string) => {
    if (!isGameActive || matchedPairs.has(words.find((w) => w.id === wordId)?.pairId || "")) {
      return;
    }

    if (selectedWord === wordId) {
      setSelectedWord(null);
    } else {
      setSelectedWord(wordId);
      // Si hay una imagen seleccionada, verificar si coincide
      if (selectedImage) {
        checkMatch(wordId, selectedImage);
      }
    }
  };

  // Manejar selección de imagen
  const handleImageClick = (imageId: string) => {
    if (!isGameActive || matchedPairs.has(images.find((i) => i.id === imageId)?.pairId || "")) {
      return;
    }

    if (selectedImage === imageId) {
      setSelectedImage(null);
    } else {
      setSelectedImage(imageId);
      // Si hay una palabra seleccionada, verificar si coincide
      if (selectedWord) {
        checkMatch(selectedWord, imageId);
      }
    }
  };

  // Verificar si la palabra y la imagen coinciden
  const checkMatch = (wordId: string, imageId: string) => {
    const word = words.find((w) => w.id === wordId);
    const image = images.find((i) => i.id === imageId);

    if (!word || !image) return;

    const isMatch = word.pairId === image.pairId;

    if (isMatch) {
      // Coincidencia correcta
      setMatchedPairs((prev) => new Set([...prev, word.pairId]));
      setSelectedWord(null);
      setSelectedImage(null);

      // Verificar si el juego está completo
      const newMatchedPairs = new Set([...matchedPairs, word.pairId]);
      if (newMatchedPairs.size === totalPairs) {
        setIsGameWon(true);
        setIsGameActive(false);
        setPoints(gameDetails.field_points || 0);

        // Actualizar ranking si se completa el juego
        if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
          setRankingUpdated(true);
          updateRanking(campaignNid, gameDetails.drupal_internal__id).catch((error) => {
            console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
          });
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } else {
      // No coincide, deseleccionar después de un breve delay
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedImage(null);
      }, 800);
    }
  };

  // Temporizador
  useEffect(() => {
    if (gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && timeLeft > 0 && isGameActive && !isGameWon) {
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
  }, [gameDetails.field_time_limit, timeLeft, isGameActive, isGameWon]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Función para reiniciar el juego
  const handleRetry = () => {
    // Reinicializar palabras e imágenes mezcladas usando la misma lógica del useEffect
    const pairs = gameDetails.field_pairs || [];
    const wordCards: WordCard[] = [];
    const imageCards: ImageCard[] = [];

    pairs.forEach((pair) => {
      const pairId = pair.id;
      
      // Agregar palabra
      wordCards.push({
        id: `word-${pairId}`,
        text: pair.field_associated_text,
        pairId: pairId,
        type: "word",
      });

      // Agregar imagen si existe
      if (pair.field_puzzle_image && pair.field_puzzle_image.length > 0) {
        const firstImage = pair.field_puzzle_image[0];
        imageCards.push({
          id: `image-${pairId}`,
          imageUrl: firstImage.url,
          imageAlt: firstImage.alt,
          pairId: pairId,
          type: "image",
        });
      }
    });

    // Mezclar las palabras e imágenes
    const shuffledWords = wordCards.sort(() => Math.random() - 0.5);
    const shuffledImages = imageCards.sort(() => Math.random() - 0.5);

    setWords(shuffledWords);
    setImages(shuffledImages);
    setSelectedWord(null);
    setSelectedImage(null);
    setMatchedPairs(new Set());
    setPoints(0);
    setTimeLeft(gameDetails.field_time_limit || 0);
    setIsGameActive(true);
    setIsGameWon(false);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  if (pairs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-red-400 shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-6">No hay pares disponibles para este juego.</p>
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
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Encabezado */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 p-6 bg-white rounded-2xl border-2 border-[#306393] shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#306393] to-blue-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
            🔗
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#306393] to-blue-400 bg-clip-text text-transparent">
              {gameDetails.field_title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          {gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && (
            <div
              className={`text-xl font-bold px-4 py-2 rounded-xl border-2 ${
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
          <div className="text-xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-400">
            ✅ {matchedPairs.size}/{totalPairs}
          </div>
          {isGameWon && (
            <div className="text-xl font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl border-2 border-purple-400">
              🌟 {points}
            </div>
          )}
        </div>
      </div>

      {gameDetails.field_description && (
        <GameInstructions text={gameDetails.field_description} />
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#306393] shadow-xl p-8 max-w-7xl w-full">
          {/* Resultado del juego */}
          {isGameWon && (
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-8 mb-4">
                <div className="text-6xl mb-3">🎉</div>
                <h3 className="text-3xl font-bold text-green-700 mb-2">
                  ¡Felicidades!
                </h3>
                <p className="text-green-600 text-lg mb-2">
                  Has emparejado todas las palabras con sus imágenes
                </p>
                <p className="text-green-700 font-bold text-xl mb-4">
                  Has ganado {points} puntos
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#d35400] to-orange-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
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
            </div>
          )}

          {/* Feedback de selección en tiempo real */}
          {(selectedWord || selectedImage) && !isGameWon && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
              {selectedWord && (
                <p className="text-center text-blue-800 font-medium text-sm">
                  ✓ Palabra seleccionada: <strong className="text-[#306393]">{words.find(w => w.id === selectedWord)?.text}</strong> - Selecciona su imagen correspondiente
                </p>
              )}
              {selectedImage && !selectedWord && (
                <p className="text-center text-blue-800 font-medium text-sm">
                  ✓ Imagen seleccionada - Selecciona su palabra correspondiente
                </p>
              )}
            </div>
          )}

          {/* Área de juego mejorada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Columna de palabras - LADO IZQUIERDO */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  A
                </div>
                <h3 className="text-2xl font-bold text-[#306393]">
                  Palabras
                </h3>
              </div>
              <div className="space-y-4">
                {words.map((word) => {
                  const isMatched = matchedPairs.has(word.pairId);
                  const isSelected = selectedWord === word.id;

                  return (
                    <button
                      key={word.id}
                      onClick={() => handleWordClick(word.id)}
                      disabled={!isGameActive || isMatched}
                      className={`
                        w-full px-6 py-5 rounded-xl text-center transition-all duration-300 transform
                        relative overflow-hidden
                        ${isMatched
                          ? "bg-green-200 border-4 border-green-500 opacity-75 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-300 border-4 border-blue-600 scale-105 shadow-xl ring-4 ring-blue-400 ring-opacity-50"
                          : "bg-white border-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 hover:shadow-lg cursor-pointer"
                        }
                      `}
                    >
                      {isMatched && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold">
                          ✓
                        </div>
                      )}
                      <span className={`text-xl font-bold ${isMatched ? "text-green-800 line-through" : isSelected ? "text-blue-900" : "text-gray-800"}`}>
                        {word.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna de imágenes - LADO DERECHO */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  B
                </div>
                <h3 className="text-2xl font-bold text-purple-700">
                  Imágenes
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image) => {
                  const isMatched = matchedPairs.has(image.pairId);
                  const isSelected = selectedImage === image.id;

                  return (
                    <button
                      key={image.id}
                      onClick={() => handleImageClick(image.id)}
                      disabled={!isGameActive || isMatched}
                      className={`
                        aspect-square relative rounded-xl overflow-hidden transition-all duration-300 transform
                        ${isMatched
                          ? "opacity-60 cursor-not-allowed border-4 border-green-500 scale-95"
                          : isSelected
                          ? "scale-110 border-4 border-purple-600 shadow-2xl ring-4 ring-purple-400 ring-opacity-50"
                          : "border-4 border-gray-300 hover:border-purple-400 hover:scale-105 hover:shadow-xl cursor-pointer"
                        }
                        bg-white
                      `}
                    >
                      {image.imageUrl ? (
                        <>
                          <Image
                            src={image.imageUrl}
                            alt={image.imageAlt || "Imagen"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {isMatched && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-70 flex items-center justify-center">
                              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
                                <span className="text-3xl font-bold text-green-600">✓</span>
                              </div>
                            </div>
                          )}
                          {isSelected && !isMatched && (
                            <div className="absolute inset-0 bg-purple-400 bg-opacity-30 flex items-center justify-center">
                              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">👆</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <span className="text-5xl text-gray-400">🖼️</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Indicador de progreso mejorado */}
          <div className="mt-8 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progreso</span>
              <span className="text-sm font-bold text-[#306393]">
                {matchedPairs.size} de {totalPairs} pares completados
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(matchedPairs.size / totalPairs) * 100}%` }}
              >
                {matchedPairs.size > 0 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round((matchedPairs.size / totalPairs) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botón para volver */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-[#306393] to-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              ← Volver a la Campaña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

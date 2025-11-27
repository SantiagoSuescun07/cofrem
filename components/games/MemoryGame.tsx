"use client";

import { useState, useEffect, useRef } from "react";
import { MemoryGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import { InfoIcon } from "lucide-react";

interface MemoryGameProps {
  gameDetails: MemoryGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

interface Card {
  id: string;
  imageId: string;
  icon: string;
  alt: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Array de iconos/emojis para usar en el juego de memoria
const MEMORY_ICONS = [
  "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎤", "🎧",
  "🎸", "🎺", "🎻", "🥁", "🎹", "🎬", "🎞️", "🎟️",
  "🎫", "🎠", "🎡", "🎢", "🎰", "🎱", "🎳", "🎴",
  "🏀", "🏈", "⚽", "⚾", "🎾", "🏐", "🏉", "🎱",
  "🏓", "🏸", "🥊", "🥋", "🥅", "⛳", "🏁", "🏆",
  "🏅", "🥇", "🥈", "🥉", "🎖️", "🏵️", "🎗️", "🎀",
  "🎁", "🎂", "🎃", "🎄", "🎅", "🎆", "🎇", "✨",
  "🎈", "🎉", "🎊", "🎋", "🎍", "🎎", "🎏", "🎐",
  "🎑", "🧧", "🎀", "🎁", "🎗️", "🎟️", "🎫", "🎪",
];

export default function MemoryGame({
  gameDetails,
  onClose,
  campaignNid,
}: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [isGameLost, setIsGameLost] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDetails.field_time_limit || 0);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parsear la dificultad (ejemplo: "6x6" -> { rows: 6, cols: 6 })
  const parseDifficulty = (difficulty: string): { rows: number; cols: number } => {
    const match = difficulty.match(/(\d+)x(\d+)/);
    if (match) {
      return { rows: parseInt(match[1], 10), cols: parseInt(match[2], 10) };
    }
    // Default a 4x4 si no se puede parsear
    return { rows: 4, cols: 4 };
  };

  const { rows, cols } = parseDifficulty(gameDetails.field_memory_difficulty || "4x4");
  const totalCards = rows * cols;

  // Inicializar las tarjetas con iconos
  useEffect(() => {
    const pairsNeeded = Math.floor(totalCards / 2);
    const pairs: Card[] = [];
    
    // Usar iconos/emojis para el juego de memoria
    const iconsToUse = MEMORY_ICONS.slice(0, pairsNeeded);
    
    for (let i = 0; i < pairsNeeded; i++) {
      const icon = iconsToUse[i];
      const pairId = `icon-pair-${i}`;
      
      // Agregar dos tarjetas con el mismo icono
      pairs.push({
        id: `${pairId}-0`,
        imageId: `icon-${i}`,
        icon: icon,
        alt: `Icon ${i + 1}`,
        isFlipped: false,
        isMatched: false,
      });
      
      pairs.push({
        id: `${pairId}-1`,
        imageId: `icon-${i}`,
        icon: icon,
        alt: `Icon ${i + 1}`,
        isFlipped: false,
        isMatched: false,
      });
    }

    // Mezclar las tarjetas
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
  }, [totalCards]);

  // Manejar el click en una tarjeta
  const handleCardClick = (index: number) => {
    if (!isGameActive || cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // Si se han volteado 2 tarjetas, verificar si coinciden
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);

      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.imageId === secondCard.imageId) {
        // Coinciden: marcar como matched
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        const newMatches = matches + 1;
        setMatches(newMatches);

        // Verificar si el juego ha terminado
        if (newMatches === totalCards / 2) {
          setIsGameWon(true);
          setIsGameActive(false);
          setPoints(gameDetails.field_points || 0);

          // Actualizar ranking si el juego se completa correctamente
          if (gameDetails.drupal_internal__id && !rankingUpdated) {
            setRankingUpdated(true);
            const finalPoints = gameDetails.field_points || 0;
            updateRanking(gameDetails.drupal_internal__id, finalPoints).catch((error) => {
              console.warn("No se pudo actualizar el ranking (esto no afecta tu puntuación):", error);
            });
          }

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } else {
        // No coinciden: voltear de nuevo después de un breve delay
        if (flipTimeoutRef.current) {
          clearTimeout(flipTimeoutRef.current);
        }
        
        flipTimeoutRef.current = setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Temporizador
  useEffect(() => {
    if (gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && timeLeft > 0 && isGameActive && !isGameWon && !isGameLost) {
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
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, [gameDetails.field_time_limit, timeLeft, isGameActive, isGameWon, isGameLost]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Función para reiniciar el juego
  const handleRetry = () => {
    // Reiniciar todas las tarjetas mezclando de nuevo
    setCards([]);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setIsGameWon(false);
    setIsGameLost(false);
    setIsGameActive(true);
    setPoints(0);
    setTimeLeft(gameDetails.field_time_limit || 0);
    setRankingUpdated(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }
    // Las tarjetas se reinicializarán automáticamente con el useEffect
  };


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
                  🧠
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl  text-gray-900">
                    {gameDetails.field_title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Memoria</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
              
                {!gameDetails.field_time_limit || gameDetails.field_time_limit === 0 ? (
                  <div className="flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-2.5 shadow-sm">
                    <span className="text-lg">⏱️</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 leading-none">Tiempo</span>
                      <span className="text-lg  leading-none text-gray-400">
                        ∞
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-2.5 shadow-sm">
                  <span className="text-lg">🎯</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-none">Movimientos</span>
                    <span className="text-lg  text-gray-700 leading-none">
                      {moves}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 rounded-xl border-2 border-green-400 px-4 py-2.5 shadow-sm">
                  <span className="text-lg">✅</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-none">Parejas</span>
                    <span className="text-lg  text-green-600 leading-none">
                      {matches}/{totalCards / 2}
                    </span>
                  </div>
                </div>
                {isGameWon && (
                  <div className="flex items-center gap-2 bg-gradient-to-br from-[#e6fff2] to-white rounded-xl border-2 border-[#09d6a6] px-4 py-2.5 shadow-sm">
                    <span className="text-lg">🌟</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 leading-none">Puntos</span>
                      <span className="text-lg  text-[#09d6a6] leading-none">
                        {points}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instrucciones */}
            {gameDetails.field_description && gameDetails.field_description.trim() !== "" && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#09d6a6] to-[#0bc9a0] rounded-lg flex items-center justify-center text-white shadow-md">
                  <InfoIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base  text-[#09d6a6] mb-1.5">
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
          <div className="bg-white rounded-2xl border-2 border-[#09d6a6]/30 shadow-xl p-6 sm:p-8 max-w-6xl w-full">
          {/* Resultado del juego */}
          {isGameWon && (
            <div className="text-center mb-6">
              <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-4">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="text-2xl  text-green-700 mb-2">
                  ¡Felicidades!
                </h3>
                <p className="text-green-600 mb-2">
                  Has encontrado todas las parejas en {moves} movimientos
                </p>
                <p className="text-green-600">
                  Has ganado {points} puntos
                </p>
                {gameDetails.field_badges?.name && (
                  <p className="text-[#09d6a6] font-bold text-xl mt-4">
                    🏆 Insignia obtenida: <span className="text-purple-600">{gameDetails.field_badges.name}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {isGameLost && (
            <div className="text-center mb-6">
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
                <div className="text-5xl mb-2">⏱️</div>
                <h3 className="text-2xl  text-red-700 mb-2">
                  ¡Tiempo agotado!
                </h3>
                <p className="text-red-600 mb-2">
                  Has encontrado {matches} de {totalCards / 2} parejas
                </p>
                <p className="text-red-600 mb-4">
                  En {moves} movimientos
                </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#09d6a6] to-[#0bc9a0] text-white rounded-xl text-lg font-semibold shadow-lg hover:from-[#0bc9a0] hover:to-[#0dbc9a] transition-all duration-200 transform hover:scale-105"
                  >
                    🔄 Reintentar
                  </button>
              </div>
            </div>
          )}

          {/* Grid de tarjetas */}
          <div
            className="grid gap-1 sm:gap-1.5 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              maxWidth: cols <= 4 ? "400px" : cols <= 6 ? "600px" : "800px",
            }}
          >
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={!isGameActive || card.isFlipped || card.isMatched || isGameLost}
                className={`
                  aspect-square relative rounded-md overflow-hidden transition-all duration-300 transform
                  ${card.isMatched 
                    ? "opacity-50 cursor-default scale-95" 
                    : card.isFlipped
                    ? "cursor-default scale-100"
                    : "cursor-pointer hover:scale-105 hover:shadow-md"
                  }
                  ${!card.isFlipped && !card.isMatched && isGameActive
                    ? "bg-gradient-to-br from-[#09d6a6] to-[#0bc9a0] hover:from-[#0bc9a0] hover:to-[#0dbc9a]"
                    : "bg-white border border-gray-200"
                  }
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="absolute inset-0 flex items-center justify-center p-0.5">
                    <div className="text-base sm:text-lg md:text-xl">{card.icon}</div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-sm sm:text-base text-white ">?</div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Botón para volver */}
          {!isGameWon && !isGameLost && (
            <div className="text-center mt-8">
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


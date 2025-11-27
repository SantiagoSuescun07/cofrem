"use client";

import { useState, useEffect, useRef } from "react";
import { SpotDifferencesGameDetails } from "@/types/games";
import { updateRanking } from "@/services/games/update-ranking";
import { InfoIcon } from "lucide-react";
import Image from "next/image";

interface SpotDifferencesGameProps {
  gameDetails: SpotDifferencesGameDetails;
  onClose: () => void;
  campaignNid?: number;
}

interface Difference {
  id: number;
  x: number; // Porcentaje de posición X (0-100)
  y: number; // Porcentaje de posición Y (0-100)
  found: boolean;
}

export default function SpotDifferencesGame({
  gameDetails,
  onClose,
  campaignNid,
}: SpotDifferencesGameProps) {
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [foundCount, setFoundCount] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(gameDetails.field_time_limit || 0);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [rankingUpdated, setRankingUpdated] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const leftImageRef = useRef<HTMLDivElement | null>(null);
  const rightImageRef = useRef<HTMLDivElement | null>(null);

  const originalImage = gameDetails.field_original_image;
  const modifiedImage = gameDetails.field_modified_image;
  const numDifferences = gameDetails.field_num_differences || 5;
  const pointsPerHit = gameDetails.field_points_per_hit || 20;

  // Generar diferencias aleatorias si no hay coordenadas
  useEffect(() => {
    if (!originalImage || !modifiedImage || differences.length > 0) return;

    // Si hay coordenadas guardadas, usarlas; si no, generar aleatorias
    if (gameDetails.field_differences_coordinates) {
      try {
        const coords = JSON.parse(gameDetails.field_differences_coordinates);
        if (Array.isArray(coords)) {
          setDifferences(
            coords.map((coord: any, index: number) => ({
              id: index,
              x: coord.x || Math.random() * 80 + 10,
              y: coord.y || Math.random() * 80 + 10,
              found: false,
            }))
          );
          return;
        }
      } catch (e) {
        console.warn("Error parsing coordinates, using random positions");
      }
    }

    // Generar diferencias aleatorias
    const newDifferences: Difference[] = [];
    for (let i = 0; i < numDifferences; i++) {
      newDifferences.push({
        id: i,
        x: Math.random() * 80 + 10, // Entre 10% y 90%
        y: Math.random() * 80 + 10,
        found: false,
      });
    }
    setDifferences(newDifferences);
  }, [originalImage, modifiedImage, numDifferences, gameDetails.field_differences_coordinates]);

  // Timer
  useEffect(() => {
    if (!isGameActive || isGameWon || !gameDetails.field_time_limit || gameDetails.field_time_limit === 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGameActive, isGameWon, gameDetails.field_time_limit]);

  // Verificar si el juego está completo
  useEffect(() => {
    if (foundCount === numDifferences && !isGameWon && isGameActive) {
      setIsGameWon(true);
      setIsGameActive(false);

      // Calcular puntos
      const basePoints = gameDetails.field_points || 100;
      const foundPoints = foundCount * pointsPerHit;
      const timeBonus = gameDetails.field_time_limit != null && gameDetails.field_time_limit > 0 
        ? Math.max(0, Math.floor(timeLeft / 10))
        : 50;
      const finalPoints = basePoints + foundPoints + timeBonus;
      
      setPoints(finalPoints);

      // Actualizar ranking
      if (campaignNid && gameDetails.drupal_internal__id && !rankingUpdated) {
        setRankingUpdated(true);
        updateRanking(campaignNid, gameDetails.drupal_internal__id).catch((error) => {
          console.warn("No se pudo actualizar el ranking:", error);
        });
      }
    }
  }, [foundCount, numDifferences, isGameWon, isGameActive, gameDetails, campaignNid, rankingUpdated, timeLeft, pointsPerHit]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, side: "left" | "right") => {
    if (!isGameActive || isGameWon || !imageLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Verificar si el click está cerca de alguna diferencia no encontrada
    const tolerance = 3; // 3% de tolerancia
    const clickedDifference = differences.find(
      (diff) =>
        !diff.found &&
        Math.abs(diff.x - x) < tolerance &&
        Math.abs(diff.y - y) < tolerance
    );

    if (clickedDifference) {
      // Marcar la diferencia como encontrada
      setDifferences((prev) =>
        prev.map((diff) =>
          diff.id === clickedDifference.id ? { ...diff, found: true } : diff
        )
      );
      setFoundCount((prev) => prev + 1);
      setPoints((prev) => prev + pointsPerHit);
      setSelectedSide(side);
      setTimeout(() => setSelectedSide(null), 300);
    }
  };

  const handleRetry = () => {
    setDifferences((prev) => prev.map((diff) => ({ ...diff, found: false })));
    setFoundCount(0);
    setIsGameWon(false);
    setIsGameActive(true);
    setPoints(0);
    setTimeLeft(gameDetails.field_time_limit || 0);
    setRankingUpdated(false);
    setImageLoaded(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!originalImage || !modifiedImage) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#e67e22]/10 via-white to-[#e67e22]/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <p className="text-red-500 text-lg">No hay imágenes disponibles para el juego</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-[#e67e22] text-white rounded-xl font-semibold hover:bg-[#e67e22]/90"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e67e22]/10 via-white to-[#e67e22]/5 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Card unificada con header e instrucciones */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-[#e67e22]/20 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#e67e22] to-[#d35400] rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🔍
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl  text-gray-900">
                    {gameDetails.field_title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Encuentra las Diferencias</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                {gameDetails.field_time_limit && gameDetails.field_time_limit > 0 ? (
                  <div className="flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-2.5 shadow-sm">
                    <span className="text-lg">⏱️</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 leading-none">Tiempo</span>
                      <span className={`text-lg  leading-none ${
                        timeLeft < 30 ? "text-red-500" : "text-gray-700"
                      }`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-2.5 shadow-sm">
                  <span className="text-lg">🔍</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-none">Encontradas</span>
                    <span className="text-lg  text-gray-700 leading-none">
                      {foundCount}/{numDifferences}
                    </span>
                  </div>
                </div>
                {isGameWon && (
                  <div className="flex items-center gap-2 bg-gradient-to-br from-[#fff4e6] to-white rounded-xl border-2 border-[#e67e22] px-4 py-2.5 shadow-sm">
                    <span className="text-lg">🌟</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 leading-none">Puntos</span>
                      <span className="text-lg  text-[#e67e22] leading-none">
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
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#e67e22] to-[#d35400] rounded-lg flex items-center justify-center text-white shadow-md">
                  <InfoIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base  text-[#e67e22] mb-1.5">
                    Instrucciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {gameDetails.field_description}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Haz clic en las diferencias que encuentres entre las dos imágenes. 
                    Debes encontrar {numDifferences} diferencias.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal del juego */}
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="bg-white rounded-2xl border-2 border-[#e67e22]/30 shadow-xl p-6 sm:p-8 max-w-7xl w-full">
            {/* Resultado del juego */}
            {isGameWon && (
              <div className="text-center mb-6">
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-4">
                  <div className="text-5xl mb-2">🎉</div>
                  <h3 className="text-2xl  text-green-700 mb-2">
                    ¡Felicidades!
                  </h3>
                  <p className="text-green-600 mb-2">
                    Has encontrado todas las {numDifferences} diferencias
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
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white rounded-xl text-lg font-semibold shadow-lg hover:from-[#d35400] hover:to-[#e67e22] transition-all duration-200 transform hover:scale-105"
                  >
                    🔄 Reintentar
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-lg font-semibold shadow-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}

            {!isGameActive && !isGameWon && gameDetails.field_time_limit && gameDetails.field_time_limit > 0 && (
              <div className="text-center mb-6">
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
                  <div className="text-5xl mb-2">⏱️</div>
                  <h3 className="text-2xl  text-red-700 mb-2">
                    ¡Tiempo agotado!
                  </h3>
                  <p className="text-red-600 mb-4">
                    Has encontrado {foundCount} de {numDifferences} diferencias
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white rounded-xl text-lg font-semibold shadow-lg hover:from-[#d35400] hover:to-[#e67e22] transition-all duration-200 transform hover:scale-105"
                  >
                    🔄 Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Imágenes lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Imagen original */}
              <div className="relative">
                <h3 className="text-center font-semibold text-gray-700 mb-2">Imagen Original</h3>
                <div
                  ref={leftImageRef}
                  onClick={(e) => handleImageClick(e, "left")}
                  className={`relative w-full cursor-crosshair border-2 rounded-lg overflow-hidden ${
                    selectedSide === "left" ? "border-[#e67e22] ring-4 ring-[#e67e22]/30" : "border-gray-300"
                  }`}
                  style={{ aspectRatio: "16/9" }}
                >
                  <Image
                    src={originalImage.url}
                    alt="Imagen original"
                    fill
                    className="object-contain"
                    onLoad={() => setImageLoaded(true)}
                  />
                  {/* Marcadores de diferencias encontradas */}
                  {differences.map((diff) => {
                    if (!diff.found) return null;
                    return (
                      <div
                        key={diff.id}
                        className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          left: `${diff.x}%`,
                          top: `${diff.y}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Imagen modificada */}
              <div className="relative">
                <h3 className="text-center font-semibold text-gray-700 mb-2">Imagen Modificada</h3>
                <div
                  ref={rightImageRef}
                  onClick={(e) => handleImageClick(e, "right")}
                  className={`relative w-full cursor-crosshair border-2 rounded-lg overflow-hidden ${
                    selectedSide === "right" ? "border-[#e67e22] ring-4 ring-[#e67e22]/30" : "border-gray-300"
                  }`}
                  style={{ aspectRatio: "16/9" }}
                >
                  <Image
                    src={modifiedImage.url}
                    alt="Imagen modificada"
                    fill
                    className="object-contain"
                  />
                  {/* Marcadores de diferencias encontradas */}
                  {differences.map((diff) => {
                    if (!diff.found) return null;
                    return (
                      <div
                        key={diff.id}
                        className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          left: `${diff.x}%`,
                          top: `${diff.y}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns, useRanking, useGameDetailsBatch } from "@/queries/games";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProgressBar } from "@/components/common/progress-bar";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent} from "@/components/ui/tabs";

function getGameTypeName(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "Sopa de letras";
    case "paragraph--puzzle_game":
      return "Rompecabezas";
    case "paragraph--trivia_game":
      return "Trivia";
    case "paragraph--complete_phrase_game":
      return "Completar frase";
    case "paragraph--emoji_discovery_game":
      return "Descubrir emoji";
    case "paragraph--hangman_game":
      return "Ahorcado";
    case "paragraph--memory_game":
      return "Memoria";
    case "paragraph--quiz_game":
      return "Quiz";
    case "paragraph--true_false_game":
      return "Verdadero o Falso";
    case "paragraph--word_match_game":
      return "Emparejar palabras";
    default:
      return "Juego";
  }
}

function getGameButtonColor(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "bg-[#306393] hover:bg-[#306393]/90";
    case "paragraph--puzzle_game":
      return "bg-[#2da2eb] hover:bg-[#2da2eb]/90";
    case "paragraph--trivia_game":
      return "bg-[#2deb79] hover:bg-[#2deb79]/90";
    case "paragraph--complete_phrase_game":
      return "bg-[#9b59b6] hover:bg-[#9b59b6]/90";
    case "paragraph--emoji_discovery_game":
      return "bg-[#f39c12] hover:bg-[#f39c12]/90";
    case "paragraph--hangman_game":
      return "bg-[#e74c3c] hover:bg-[#e74c3c]/90";
    case "paragraph--memory_game":
      return "bg-[#3498db] hover:bg-[#3498db]/90";
    case "paragraph--quiz_game":
      return "bg-[#16a085] hover:bg-[#16a085]/90";
    case "paragraph--true_false_game":
      return "bg-[#27ae60] hover:bg-[#27ae60]/90";
    case "paragraph--word_match_game":
      return "bg-[#d35400] hover:bg-[#d35400]/90";
    default:
      return "bg-[#306393] hover:bg-[#306393]/90";
  }
}

function getGameIconBg(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "bg-[#306393]/10";
    case "paragraph--puzzle_game":
      return "bg-[#2da2eb]/10";
    case "paragraph--trivia_game":
      return "bg-[#2deb79]/10";
    case "paragraph--complete_phrase_game":
      return "bg-[#9b59b6]/10";
    case "paragraph--emoji_discovery_game":
      return "bg-[#f39c12]/10";
    case "paragraph--hangman_game":
      return "bg-[#e74c3c]/10";
    case "paragraph--memory_game":
      return "bg-[#3498db]/10";
    case "paragraph--quiz_game":
      return "bg-[#16a085]/10";
    case "paragraph--true_false_game":
      return "bg-[#27ae60]/10";
    case "paragraph--word_match_game":
      return "bg-[#d35400]/10";
    default:
      return "bg-[#306393]/10";
  }
}

function getGameRoute(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "/games/wordsearch";
    case "paragraph--puzzle_game":
      return "/games/puzzle";
    case "paragraph--trivia_game":
      return "/games/trivia";
    case "paragraph--complete_phrase_game":
      return "/games/complete-phrase";
    case "paragraph--emoji_discovery_game":
      return "/games/emoji-discovery";
    case "paragraph--hangman_game":
      return "/games/hangman";
    case "paragraph--memory_game":
      return "/games/memory";
    case "paragraph--quiz_game":
      return "/games/quiz";
    case "paragraph--true_false_game":
      return "/games/true-false";
    case "paragraph--word_match_game":
      return "/games/word-match";
    default:
      return null;
  }
}

export default function GamesPage() {
  const router = useRouter();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: ranking, isLoading: rankingLoading } = useRanking();
  const [activeTab, setActiveTab] = useState<"games" | "ranking">("games");

  // Obtener la primera campaña
  const campaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;

  // Usar React Query para cargar detalles de todos los juegos en paralelo con caché
  const { gameDetailsMap, loadingGames, isLoading: gamesDetailsLoading } = useGameDetailsBatch(
    campaign?.field_game_type || null
  );

  // Convertir los juegos de la campaña al formato para mostrar
  // Este useMemo DEBE estar antes de cualquier return condicional para cumplir con las reglas de hooks
  const games = React.useMemo(() => {
    if (!campaign?.field_game_type || campaign.field_game_type.length === 0) {
      return [];
    }

    return campaign.field_game_type.map((gameType) => {
      const gameDetails = gameDetailsMap[gameType.id];
      const route = getGameRoute(gameType.type);
      const isImplemented = route !== null;

      return {
        id: gameType.id,
        type: gameType.type,
        name: gameDetails?.field_title || getGameTypeName(gameType.type),
        description: gameDetails?.field_description || null,
        enabled: isImplemented,
        buttonColor: getGameButtonColor(gameType.type),
        iconBg: getGameIconBg(gameType.type),
        route: route,
        details: gameDetails,
        href: gameType.href,
      };
    });
  }, [campaign, gameDetailsMap]);

  if (campaignsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        <div className="text-center py-12">
          <p className="text-red-500">No hay campañas disponibles</p>
        </div>
      </div>
    );
  }

  const renderGameCard = (game: typeof games[0]) => {
    const isLoading = loadingGames.has(game.id);
    const isDisabled = !game.enabled || isLoading;
    
    return (
      <div
        key={game.id}
        className={`bg-white p-6 rounded-xl border border-gray-200 transition-shadow ${
          isDisabled ? "opacity-60" : "hover:shadow-lg"
        }`}
      >
        <div className="text-center">
          {isLoading ? (
            <div className="w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#306393]"></div>
            </div>
          ) : game.details?.field_icon ? (
            <div className="w-24 h-24 mx-auto mb-4 relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={game.details.field_icon.url}
                alt={game.details.field_icon.alt || game.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div
              className={`w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center ${game.iconBg || "bg-[#306393]/10"}`}
            >
              <div className="w-16 h-16 bg-gray-300 rounded"></div>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
            {game.details?.field_title || game.name}
          </h3>
          {game.details?.field_description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {game.details.field_description}
            </p>
          )}
          <button
            onClick={() => {
              if (game.route) {
                // Pasar el ID del juego como parámetro
                router.push(`${game.route}?id=${game.id}`);
              } else {
                alert("Este tipo de juego aún no está implementado");
              }
            }}
            className={`w-full px-4 py-2 ${
              isDisabled
                ? "bg-neutral-400 cursor-not-allowed"
                : game.buttonColor
            } text-white rounded-lg transition-colors`}
            disabled={isDisabled}
          >
            {isLoading ? "Cargando..." : isDisabled ? "Próximamente" : "A jugar"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-3">
              Gamificación
              <ProgressBar />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Banner con imagen de fondo y título superpuesto */}
      <div className="relative rounded-2xl mb-8 overflow-hidden h-94">
        {campaign.field_main_image ? (
          <>
            <Image
              src={campaign.field_main_image.url}
              alt={campaign.field_main_image.alt || campaign.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <h1 className="text-4xl font-bold !text-white text-center px-4">
                {campaign.title}
              </h1>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-[#306393]/10 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-900 text-center px-4">
              {campaign.title}
            </h1>
          </div>
        )}
      </div>

      {/* Sección de descripción */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#306393] mb-4">
              {campaign.title}
            </h2>
            <div
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.body }}
            />
          </div>
        </div>
      </div>

      {/* Tabs para alternar entre juegos y ranking */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "games" | "ranking")} className="w-full">
        <div className="flex justify-end items-center mb-6">
  
          {activeTab === "games" && (
            <Button
              onClick={() => setActiveTab("ranking")}
              className="bg-[#306393] hover:bg-[#306393]/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Trophy className="w-5 h-5" />
              Ver Ranking
            </Button>
          )}
          {activeTab === "ranking" && (
            <Button
              onClick={() => setActiveTab("games")}
              className="bg-[#306393] hover:bg-[#306393]/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Gamepad2 className="w-5 h-5" />
              Ver Juegos
            </Button>
          )}
        </div>

        <TabsContent value="games" className="mt-0">
          {/* Tarjetas de juegos en grid */}
          {campaignsLoading || gamesDetailsLoading || loadingGames.size > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse"
                >
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => renderGameCard(game))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
              <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay juegos disponibles</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ranking" className="mt-0">
          {rankingLoading ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#306393] mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando ranking...</p>
              </div>
            </div>
          ) : ranking && ranking.ranking && ranking.ranking.length > 0 ? (
            <div className="space-y-8">
      

              {/* Ranking - Lista Completa de Posiciones */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header de la tabla */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-700">
                    <div className="col-span-1 text-center">Pos</div>
                    <div className="col-span-5">Usuario</div>
                    <div className="col-span-2 text-center">Área</div>
                    <div className="col-span-2 text-center">Puntos</div>
                    <div className="col-span-2 text-center">Juegos</div>
                  </div>
                </div>

                {/* Lista de posiciones */}
                <div className="divide-y divide-gray-100">
                  {ranking.ranking.map((entry: typeof ranking.ranking[0], index: number) => {
                    // Iconos y colores según la posición
                    const getPositionStyle = (position: number) => {
                      if (position === 1) {
                        return {
                          icon: <Crown className="w-5 h-5 text-yellow-500" />,
                          bgColor: "bg-yellow-50",
                          borderColor: "border-yellow-300",
                          textColor: "text-yellow-700",
                        };
                      }
                      if (position === 2) {
                        return {
                          icon: <Medal className="w-5 h-5 text-gray-400" />,
                          bgColor: "bg-gray-50",
                          borderColor: "border-gray-300",
                          textColor: "text-gray-700",
                        };
                      }
                      if (position === 3) {
                        return {
                          icon: <Medal className="w-5 h-5 text-amber-600" />,
                          bgColor: "bg-amber-50",
                          borderColor: "border-amber-300",
                          textColor: "text-amber-700",
                        };
                      }
                      return {
                        icon: null,
                        bgColor: "",
                        borderColor: "",
                        textColor: "text-gray-600",
                      };
                    };

                    const positionStyle = getPositionStyle(entry.position);
                    const isCurrentUser = entry.is_current_user;

                    return (
                      <div
                        key={index}
                        className={`px-6 py-4 transition-colors ${
                          isCurrentUser
                            ? "bg-[#306393]/10 border-l-4 border-l-[#306393] font-semibold"
                            : "hover:bg-gray-50"
                        } ${positionStyle.bgColor}`}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Posición */}
                          <div className="col-span-1 flex items-center justify-center gap-2">
                            {positionStyle.icon ? (
                              <div className="flex items-center gap-1">
                                {positionStyle.icon}
                                <span className={`text-lg font-bold ${positionStyle.textColor}`}>
                                  {entry.position}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`text-lg font-bold ${
                                  isCurrentUser ? "text-[#306393]" : positionStyle.textColor
                                }`}
                              >
                                {entry.position}
                              </span>
                            )}
                          </div>

                          {/* Usuario */}
                          <div className="col-span-5 flex items-center gap-2">
                            <p
                              className={`font-semibold truncate ${
                                isCurrentUser ? "text-[#306393]" : "text-gray-900"
                              }`}
                            >
                              {entry.user}
                            </p>
                            {isCurrentUser && (
                              <span className="flex-shrink-0 text-xs bg-[#306393] text-white px-2 py-1 rounded-full font-semibold">
                                Tú
                              </span>
                            )}
                          </div>

                          {/* Área */}
                          <div className="col-span-2 text-center">
                            <span className="text-sm text-gray-600">
                              {entry.area || "-"}
                            </span>
                          </div>

                          {/* Puntos */}
                          <div className="col-span-2 text-center">
                            <p
                              className={`font-bold ${
                                isCurrentUser ? "text-[#306393]" : "text-gray-900"
                              }`}
                            >
                              {entry.points}
                            </p>
                            <p className="text-xs text-gray-500">puntos</p>
                          </div>

                          {/* Juegos completados */}
                          <div className="col-span-2 text-center">
                            <p className="text-sm font-medium text-gray-700">
                              {entry.games_completed}
                            </p>
                            <p className="text-xs text-gray-500">juegos</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay datos de ranking disponibles</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

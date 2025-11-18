"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns, useGameDetails, useRanking } from "@/queries/games";
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

function getGameTypeIcon(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "🔤";
    case "paragraph--puzzle_game":
      return "🧩";
    case "paragraph--trivia_game":
      return "❓";
    default:
      return "🎮";
  }
}

function getGameTypeName(gameType: string) {
  switch (gameType) {
    case "paragraph--wordsearch_game":
      return "Sopa de letras";
    case "paragraph--puzzle_game":
      return "Rompecabezas";
    case "paragraph--trivia_game":
      return "Trivia";
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
    default:
      return "bg-[#306393] hover:bg-[#306393]/90";
  }
}

export default function GamesPage() {
  const router = useRouter();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: ranking, isLoading: rankingLoading } = useRanking();
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "ranking">("games");

  // Obtener la primera campaña
  const campaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;

  React.useEffect(() => {
    if (campaign?.field_game_type?.href) {
      setGameUrl(campaign.field_game_type.href);
    }
  }, [campaign]);

  const { data: gameDetails, isLoading: gameLoading } = useGameDetails(gameUrl);

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

  const gameType = campaign.field_game_type?.type || "";
  const gameIcon = getGameTypeIcon(gameType);
  const gameName = getGameTypeName(gameType);
  const buttonColor = getGameButtonColor(gameType);

  // Array de juegos para mostrar en el grid
  // Puedes agregar más juegos aquí con diferentes estados (habilitado/deshabilitado)
  const games = [
    {
      id: 1,
      type: gameType || "paragraph--wordsearch_game",
      name: gameName || "Sopa de letras",
      enabled: true,
      icon: gameIcon || "🔤",
      buttonColor: buttonColor || "bg-[#306393] hover:bg-[#306393]/90",
      iconBg: "bg-[#306393]/10",
    },
    {
      id: 2,
      type: "paragraph--puzzle_game",
      name: "Rompecabezas",
      enabled: false,
      icon: "🧩",
      buttonColor: "bg-[#2da2eb] hover:bg-[#2da2eb]/90",
      iconBg: "bg-[#2da2eb]/10",
    },
    {
      id: 3,
      type: "paragraph--trivia_game",
      name: "Trivia",
      enabled: false,
      icon: "❓",
      buttonColor: "bg-[#2deb79] hover:bg-[#2deb79]/90",
      iconBg: "bg-[#2deb79]/10",
    },
  ];

  const renderGameCard = (game: typeof games[0]) => {
    const isDisabled = !game.enabled || gameLoading;
    
    return (
      <div
        key={game.id}
        className={`bg-white p-6 rounded-xl border border-gray-200 transition-shadow ${
          isDisabled ? "opacity-60" : "hover:shadow-lg"
        }`}
      >
        <div className="text-center">
          {gameDetails?.field_icon && game.id === 1 ? (
            <div className="w-24 h-24 mx-auto mb-4 relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={"/icons/rompecabezas.png"}
                alt={gameDetails.field_icon.alt || game.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div
              className={`w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center ${game.iconBg || "bg-[#306393]/10"}`}
            >
              <span className="text-5xl">{game.icon}</span>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            {game.name}
          </h3>
          <button
            onClick={() => {
              if (game.type === "paragraph--wordsearch_game") {
                router.push(`/games/wordsearch`);
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
            {isDisabled ? "Próximamente" : "A jugar"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-xl border border-gray-200"
                  >
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#306393] mx-auto mb-4"></div>
                      <p className="text-gray-500">Cargando juego...</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              games.map((game) => renderGameCard(game))
            )}
          </div>
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

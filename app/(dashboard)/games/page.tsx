"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns, useGameDetails } from "@/queries/games";
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
import { Trophy } from "lucide-react";
import Image from "next/image";

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
  const [gameUrl, setGameUrl] = useState<string | null>(null);

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
      <div className="relative rounded-2xl mb-8 overflow-hidden h-64">
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

      <div className="md:ml-4 flex-shrink-0 w-full flex justify-end pr-4 mb-6">
        <Button className="bg-[#306393] hover:bg-[#306393]/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap">
          <Trophy className="w-5 h-5" />
          Ranking
        </Button>
      </div>

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
    </div>
  );
}

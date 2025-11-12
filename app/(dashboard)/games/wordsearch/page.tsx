"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns, useGameDetails } from "@/queries/games";
import WordSearchGame from "@/components/games/WordSearchGame";
import { GameConfig } from "@/types/games";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function parseDirections(
  directions: string[]
): {
  horizontal: boolean;
  vertical: boolean;
  diagonal: boolean;
  reverse: boolean;
} {
  return {
    horizontal: directions.includes("horizontal"),
    vertical: directions.includes("vertical"),
    diagonal: directions.includes("diagonal"),
    reverse: directions.includes("orden inverso"),
  };
}

function parseGridSize(gridSize: string): 10 | 15 | 20 {
  const size = parseInt(gridSize.split("x")[0]);
  if (size === 10) return 10;
  if (size === 15) return 15;
  if (size === 20) return 20;
  return 15; // Default
}

function parseWords(wordsString: string): string[] {
  return wordsString
    .split(",")
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length > 0);
}

function gameDetailsToConfig(
  campaignTitle: string,
  gameDetails: any
): GameConfig {
  const words = parseWords(gameDetails.field_words_to_find || "");
  const directions = parseDirections(
    gameDetails.field_word_directions || []
  );
  const gridSize = parseGridSize(gameDetails.field_grid_size || "15x15");

  return {
    title: gameDetails.field_title || campaignTitle,
    description: gameDetails.field_description || "",
    words,
    pointsPerWord: gameDetails.field_points_per_word || 10,
    gridSize,
    directions,
    timeLimit: gameDetails.field_time_limit || 0,
    difficulty: "easy",
  };
}

export default function WordSearchPage() {
  const router = useRouter();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  // Obtener la primera campaña
  const campaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;

  useEffect(() => {
    if (campaign?.field_game_type?.href) {
      setGameUrl(campaign.field_game_type.href);
    }
  }, [campaign]);

  const { data: gameDetails, isLoading: gameLoading } = useGameDetails(gameUrl);

  useEffect(() => {
    if (campaign && gameDetails) {
      const config = gameDetailsToConfig(campaign.title, gameDetails);
      setGameConfig(config);
    }
  }, [campaign, gameDetails]);

  if (campaignsLoading || gameLoading || !gameConfig) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#306393] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando juego...</p>
        </div>
      </div>
    );
  }

  if (!campaign || !gameDetails) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        <div className="text-center py-12">
          <p className="text-red-500">Juego no encontrado</p>
          <button
            onClick={() => router.push("/games")}
            className="mt-4 px-4 py-2 bg-[#306393] text-white rounded-lg hover:bg-[#306393]/90"
          >
            Volver a la Campaña
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/games">Gamificación</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sopa de Letras</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <WordSearchGame
        config={gameConfig}
        onClose={() => router.push("/games")}
        campaignNid={campaign?.drupal_internal__nid}
      />
    </div>
  );
}


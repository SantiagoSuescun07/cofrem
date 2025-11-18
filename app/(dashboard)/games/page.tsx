import { useGamificationBannerQuery } from "@/queries/gamification";
import React from "react";

export default function GamesPage() {
  const banner = useGamificationBannerQuery()

  console.log("BANNERs: ", banner)
  
  return (
    <div className="max-w-6xl mx-auto">
      
    </div>
  );
}

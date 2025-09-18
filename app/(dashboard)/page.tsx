"use client";

import { HeroSection } from "@/components/common/hero-section";
import { NewsSection } from "@/components/common/news-section";
import { RightSidebar } from "@/components/common/right-sidebar";
import { useCurrentTime } from "@/hooks/use-current-time";
import React, { useState } from "react";
import { QuickAccessGrid } from "@/components/common/quick-access-grid";
import { newsData, quickAccessData } from "@/constants/mock-data";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("dashboard");
  const currentTime = useCurrentTime();

  const [currentUser] = useState({
    name: "María González",
    email: "maria.gonzalez@cofrem.gov.co",
    avatar: "https://www.factoryim.co/maria.jpeg",
    role: "Analista de RRHH",
    area: "Recursos Humanos",
    sede: "Sede Principal",
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HeroSection currentUser={currentUser} currentTime={currentTime} />
          <QuickAccessGrid quickAccessData={quickAccessData} />

          <NewsSection
            newsData={newsData}
            onViewAll={() => router.push("/news")}
          />
        </div>
        <RightSidebar onPlayGames={() => router.push("/games")} />
      </div>
    </div>
  );
}

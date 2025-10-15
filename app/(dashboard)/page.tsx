"use client";

import { HeroSection } from "@/components/common/hero-section";
import { NewsSection } from "@/components/common/news-section";
import { RightSidebar } from "@/components/common/right-sidebar";
import { useCurrentTime } from "@/hooks/use-current-time";
import React, { useState } from "react";
import { QuickAccessGrid } from "@/components/common/quick-access-grid";
import { quickAccessData } from "@/constants/mock-data";
import { useRouter } from "next/navigation";
import { PublicationsSection } from "@/components/common/publications-section";

export default function HomePage() {
  const router = useRouter();
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
    <div className="max-w-7xl mx-auto space-y-8 px-6 md:px-10 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HeroSection />
          <QuickAccessGrid quickAccessData={quickAccessData} />

          <NewsSection />
          <PublicationsSection />
        </div>
        <RightSidebar onPlayGames={() => router.push("/games")} />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser] = useState({
    name: "María González",
    email: "maria.gonzalez@cofrem.gov.co",
    avatar: "https://www.factoryim.co/maria.jpeg",
    role: "Analista de RRHH",
    area: "Recursos Humanos",
    sede: "Sede Principal",
  });

  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3);
  // const currentTime = useCurrentTime();

  const sidebarItems = [
    { id: "dashboard", label: "Inicio", icon: "Home", url: "/" },
    { id: "news", label: "Noticias", icon: "Bell", url: "/news" },
    { id: "directory", label: "Directorio", icon: "Users", url: "/directory" },
    {
      id: "documents",
      label: "Documentos",
      icon: "FileText",
      url: "/documents",
    },
    { id: "calendar", label: "Calendario", icon: "Calendar", url: "/calendar" },
    {
      id: "employee",
      label: "Portal Empleado",
      icon: "User",
      url: "/employee",
    },
    { id: "games", label: "Entretenimiento", icon: "Gamepad2", url: "/games" },
    {
      id: "settings",
      label: "Configuración",
      icon: "Settings",
      url: "/settings",
    },
  ];

  const handleGoogleLogin = () => {
    alert(
      "🔐 Autenticación con Google Workspace\n\nIntegración SSO configurada para:\n• Gmail corporativo\n• Google Drive\n• Google Calendar\n• Google Directory"
    );
  };

  // const renderDashboard = () => (
  //   <div className="max-w-7xl mx-auto space-y-8">
  //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  //       <div className="lg:col-span-2 space-y-8">
  //         <HeroSection currentUser={currentUser} currentTime={currentTime} />
  //         <QuickAccessGrid quickAccessData={quickAccessData} />

  //         <NewsSection
  //           newsData={newsData}
  //           onViewAll={() => setActiveModule("news")}
  //         />
  //       </div>
  //       <RightSidebar onPlayGames={() => setActiveModule("games")} />
  //     </div>
  //   </div>
  // );

  // const renderNews = () => <NewsPage />;

  // const renderGames = () => (
  //   <div className="max-w-6xl mx-auto">
  //     <h2 className="text-2xl font-bold text-gray-900 mb-8">
  //       Centro de Entretenimiento
  //     </h2>
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  //       {[
  //         "Trivia COFREM",
  //         "Sopa de Letras",
  //         "Memoria",
  //         "Encuentra las Diferencias",
  //       ].map((game, index) => (
  //         <div
  //           key={index}
  //           className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
  //         >
  //           <div className="text-center">
  //             <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
  //               <span className="text-2xl text-white">🎮</span>
  //             </div>
  //             <h3 className="font-semibold text-gray-900 mb-2">{game}</h3>
  //             <p className="text-sm text-gray-600 mb-4">
  //               Jugadores: {Math.floor(Math.random() * 50) + 10}
  //             </p>
  //             <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
  //               Jugar
  //             </button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // const renderModule = () => {
  //   switch (activeModule) {
  //     case "dashboard":
  //       return renderDashboard();
  //     case "news":
  //       return renderNews();
  //     case "games":
  //       return renderGames();
  //     default:
  //       return (
  //         <div className="text-center py-12">
  //           <p className="text-gray-500">Módulo en desarrollo</p>
  //           <button
  //             onClick={() => setActiveModule("dashboard")}
  //             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //           >
  //             Volver al inicio
  //           </button>
  //         </div>
  //       );
  //   }
  // };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        sidebarItems={sidebarItems}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onGoogleLogin={handleGoogleLogin}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          notifications={notifications}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-10 py-5">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

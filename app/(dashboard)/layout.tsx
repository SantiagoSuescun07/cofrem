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

  const sidebarItems = [
    { id: "dashboard", label: "Inicio", icon: "Home", url: "/" },
    { id: "news", label: "Noticias", icon: "Bell", url: "/news" },
    // { id: "newsletters", label: "Boletines", icon: "Newspaper", url: "/newsletters" },
    { id: "directory", label: "Directorio", icon: "Users", url: "/directory" },
    // {
    //   id: "documents",
    //   label: "Documentos",
    //   icon: "FileText",
    //   url: "/documents",
    // },
    { id: "calendar", label: "Calendario", icon: "Calendar", url: "/calendar" },
    // {
    //   id: "employee",
    //   label: "Portal Empleado",
    //   icon: "User",
    //   url: "/employee",
    // },
    { id: "games", label: "Entretenimiento", icon: "Gamepad2", url: "/games" },
    // {
    //   id: "settings",
    //   label: "Configuración",
    //   icon: "Settings",
    //   url: "/settings",
    // },
    {
      id: "pqrs",
      label: "PQRS",
      icon: "HelpCircle",
      url: "/pqrs",
    },
  ];

  const handleGoogleLogin = () => {
    alert(
      "🔐 Autenticación con Google Workspace\n\nIntegración SSO configurada para:\n• Gmail corporativo\n• Google Drive\n• Google Calendar\n• Google Directory"
    );
  };

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

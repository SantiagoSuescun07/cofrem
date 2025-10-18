"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";
import { useSession } from "next-auth/react";

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

  const { data: session } = useSession();

  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3);

  const sidebarItems = [
    { id: "dashboard", label: "Inicio", icon: "/icons/home.png", url: "/" },
    { id: "news", label: "Noticias", icon: "/icons/news.png", url: "/news" },
    {
      id: "directory",
      label: "Directorio",
      icon: "/icons/directory.png",
      url: "/directory",
    },
    {
      id: "management-system",
      label: "Sistema de Gestión de calidad",
      icon: "/icons/management-system.png",
      url: "management-system",
    },
    {
      id: "about",
      label: "Nosotros",
      icon: "/icons/about-us.png",
      url: "/about-us",
    },
    {
      id: "games",
      label: "Gamificación",
      icon: "/icons/gamification.png",
      url: "/games",
    },
    {
      id: "calendar",
      label: "Calendario",
      icon: "/icons/calendar.png",
      url: "/calendar",
    },
    {
      id: "pqrs",
      label: "PQRS",
      icon: "/icons/news.png",
      url: "/pqrs",
    },
  ];

  useEffect(() => {
    if (
      session?.drupal?.accessToken &&
      !localStorage.getItem("cofrem.access_token")
    ) {
      console.log("Se ejecuta el useEffect");
      localStorage.setItem("cofrem.access_token", session.drupal.accessToken);
      localStorage.setItem("cofrem.user", JSON.stringify(session.drupal.user));
    }
  }, [session?.drupal?.accessToken]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        sidebarItems={sidebarItems}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          notifications={notifications}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto ">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

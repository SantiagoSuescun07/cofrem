"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";
import { BreadcrumbHeader } from "@/components/directory/breadcrumb-header";
import { useAreas } from "@/queries/directory/useAreas";
import { DirectorySidebar } from "@/components/directory/DirectorySidebar";
import { DirectorySidebarMobile } from "@/components/directory/DirectorySidebarMobile";
import { DirectoryTabsContent } from "@/components/directory/DirectoryTabsContent";
import { DirectorySkeleton } from "@/components/directory/skeleton-directory";
import { AboutSidebar } from "@/components/about/AboutSidebar";
import { AboutSidebarMobile } from "@/components/about/AboutSidebarMobile";
import { AboutContent } from "@/components/common/about-content";
import { AboutUsNode } from "@/services/about/get-menu";
import { ManagementSystemLayout } from "@/components/management/ManagementSystemLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  // Inicialización de módulos - se establecerá dinámicamente cuando se carguen los documentos
  const [openCollapser, setOpenCollapser] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMainSidebar, setShowMainSidebar] = useState(false);
  const [showMainSheet, setShowMainSheet] = useState(false);
  const [openCollapse, setOpenCollapse] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<AboutUsNode | null>(
    null
  );
  const [notifications] = useState(3);
  const [activeModule, setActiveModule] = useState("dashboard");

  const [currentUser] = useState({
    name: "María González",
    email: "maria.gonzalez@cofrem.gov.co",
    avatar: "https://www.factoryim.co/maria.jpeg",
    role: "Analista de RRHH",
    area: "Recursos Humanos",
    sede: "Sede Principal",
  });

  const sidebarItems = [
    { id: "dashboard", label: "Inicio", icon: "/icons/home.png", url: "/" },
    { id: "news", label: "Noticias", icon: "/icons/news.png", url: "/noticias" },
    {
      id: "directory",
      label: "Directorio",
      icon: "/icons/directory.png",
      url: "/directory",
    },
    {
      id: "management-system",
      label: "Sistema de Gestión",
      icon: "/icons/management-system.png",
      url: "/management-system",
    },
    {
      id: "about",
      label: "Nosotros",
      icon: "/icons/about-us.png",
      url: "/nosotros",
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
    { id: "pqrs", label: "PQRS", icon: "/icons/news.png", url: "/pqrs" },
  ];

  const { data: areas, isLoading } = useAreas();

  useEffect(() => {
    if (
      session?.drupal?.accessToken &&
      !localStorage.getItem("cofrem.access_token")
    ) {
      localStorage.setItem("cofrem.access_token", session.drupal.accessToken);
      localStorage.setItem("cofrem.user", JSON.stringify(session.drupal.user));
    }
  }, [session?.drupal?.accessToken]);

  useEffect(() => {
    if (!pathname.startsWith("/directory")) setShowMainSidebar(false);
    if (!pathname.startsWith("/about-us")) setShowMainSidebar(false);
  }, [pathname]);

  // 🔹 Directorio Layout
  if (pathname.startsWith("/directory")) {
    if (isLoading || !areas?.length) {
      return <DirectorySkeleton />;
    }

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
        <Tabs
          defaultValue={String(areas[0].id)}
          orientation="vertical"
          className="flex flex-1 flex-col md:flex-row w-full gap-0"
        >
          <DirectorySidebar
            areas={areas}
            openCollapse={openCollapse}
            setOpenCollapse={setOpenCollapse}
            router={router}
            onShowMainSidebar={() => setShowMainSidebar(true)}
          />
          <DirectorySidebarMobile
            open={showMainSheet}
            setOpen={setShowMainSheet}
            areas={areas}
            openCollapse={openCollapse}
            setOpenCollapse={setOpenCollapse}
            router={router}
            onShowMainSidebar={() => setShowMainSidebar(true)}
          />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Header
              onMenuClick={() => setShowMainSheet(true)}
              notifications={notifications}
            />
            <BreadcrumbHeader name="Directorio" />
            <div className="flex-1 overflow-y-auto p-8">
              <DirectoryTabsContent areas={areas} />
            </div>
          </main>
        </Tabs>

        {showMainSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <Sidebar
              isOpen
              onClose={() => setShowMainSidebar(false)}
              currentUser={currentUser}
              sidebarItems={sidebarItems}
              activeModule={activeModule}
              onModuleChange={(id) => {
                setActiveModule(id);
                setShowMainSidebar(false);
                const item = sidebarItems.find((s) => s.id === id);
                if (item?.url) router.push(item.url);
              }}
            />
          </div>
        )}
      </div>
    );
  }
  if (pathname.startsWith("/about-us")) {
    if (isLoading || !areas?.length) {
      return <DirectorySkeleton />;
    }

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
        <AboutSidebar
          onSelectSection={setSelectedSection}
          router={router}
          onShowMainSidebar={() => setShowMainSidebar(true)}
        />
        <AboutSidebarMobile
          open={showMainSheet}
          setOpen={setShowMainSheet}
          router={router}
          onSelectSection={setSelectedSection}
          onShowMainSidebar={() => setShowMainSidebar(true)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setShowMainSheet(true)}
            notifications={notifications}
          />
          <BreadcrumbHeader name="Nosotros" />
          <div className="flex-1 overflow-y-auto p-8">
            <AboutContent section={selectedSection} />
          </div>
        </main>

        {showMainSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <Sidebar
              isOpen
              onClose={() => setShowMainSidebar(false)}
              currentUser={currentUser}
              sidebarItems={sidebarItems}
              activeModule={activeModule}
              onModuleChange={(id) => {
                setActiveModule(id);
                setShowMainSidebar(false);
                const item = sidebarItems.find((s) => s.id === id);
                if (item?.url) router.push(item.url);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (pathname.startsWith("/management-system")) {
    return (
      <ManagementSystemLayout
        openCollapser={openCollapser}
        setOpenCollapser={setOpenCollapser}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showMainSheet={showMainSheet}
        setShowMainSheet={setShowMainSheet}
        showMainSidebar={showMainSidebar}
        setShowMainSidebar={setShowMainSidebar}
        notifications={notifications}
        router={router}
        currentUser={currentUser}
        sidebarItems={sidebarItems}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
    );
  }

  // 🔹 Layout general
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        sidebarItems={sidebarItems}
        activeModule={activeModule}
        onModuleChange={(id) => {
          setActiveModule(id);
          const item = sidebarItems.find((s) => s.id === id);
          if (item?.url) router.push(item.url);
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          notifications={notifications}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

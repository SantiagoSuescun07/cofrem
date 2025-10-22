"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { BreadcrumbHeader } from "@/components/directory/breadcrumb-header";
import { ProfileCard } from "@/components/directory/profile-card";
import Image from "next/image";
import { UserProfile } from "@/components/common/user-profile";

const employeesByDivision = {
  planeacion: [
    {
      name: "María González",
      position: "Pérez",
      division: "Planeación Corporativa",
      jobTitle: "Directora de Planeación",
      phone: "Ext. 3891 - 3167448995",
      email: "planeacion@cofrem.com.co",
      imageUrl: "/professional-business-person.png",
    },
  ],
  sistemas: [
    {
      name: "Carlos Andrés",
      position: "Mesa Barbosa",
      division: "División de Sistemas de Gestión Corporativo",
      jobTitle: "Jefe División de Sistemas de Gestión Corporativo",
      phone: "Ext. 3892 - 3167448996",
      email: "calidad@cofrem.com.co",
      imageUrl: "/professional-business-person.png",
    },
  ],
  tecnologia: [
    {
      name: "Juan Pérez",
      position: "Rodríguez",
      division: "División Tecnologías de la Información",
      jobTitle: "Jefe de Tecnología",
      phone: "Ext. 3893 - 3167448997",
      email: "tecnologia@cofrem.com.co",
      imageUrl: "/professional-business-person.png",
    },
  ],
  mesa: [],
  consejo: [],
  administrativa: [],
  auditoria: [],
  servicios: [],
  educacion: [],
  financiera: [],
  revisora: [],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMainSidebar, setShowMainSidebar] = useState(false);
  const [openCollapse, setOpenCollapse] = useState<string | null>(null);
  const [notifications] = useState(3);

  const [currentUser] = useState({
    name: "María González",
    email: "maria.gonzalez@cofrem.gov.co",
    avatar: "https://www.factoryim.co/maria.jpeg",
    role: "Analista de RRHH",
    area: "Recursos Humanos",
    sede: "Sede Principal",
  });

  const [activeModule, setActiveModule] = useState("dashboard");

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
      url: "/management-system",
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
      localStorage.setItem("cofrem.access_token", session.drupal.accessToken);
      localStorage.setItem("cofrem.user", JSON.stringify(session.drupal.user));
    }
  }, [session?.drupal?.accessToken]);

  // 🔹 Si cambias de ruta fuera del directorio, cerramos el overlay
  useEffect(() => {
    if (!pathname.startsWith("/directory")) {
      setShowMainSidebar(false);
    }
  }, [pathname]);

  // 🔹 Layout especial para /directory
  if (pathname.startsWith("/directory")) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
        <Tabs
          defaultValue="sistemas"
          orientation="vertical"
          className="flex flex-1 flex-col md:flex-row w-full"
        >
          {/* Sidebar del directorio */}
          <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col md:sticky md:top-0 md:h-screen z-10">
            <div className="flex items-center justify-between h-[74px] px-6 border-b border-gray-100">
              <Image
                src="/icons/logo_cofrem.svg"
                alt=""
                width={100}
                height={30}
                priority
                className="h-[40px] w-auto"
              />
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="p-6 border-b border-gray-100 cursor-pointer hover:bg-[#2deb7915] w-full transition-colors"
            >
              <UserProfile />
            </button>

            {/* Menú */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4 flex flex-col justify-center items-center">
                {/* 🔹 Botón “Menú Principal” muestra el overlay sin borrar contenido */}
                <button
                  onClick={() => setShowMainSidebar(true)}
                  className="flex items-center gap-2 text-[#2f8cbd] font-medium mb-4 px-2 hover:text-[#11c99d] transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span>Menú Principal</span>
                </button>

                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                  {[
                    ["planeacion", "Planeación Corporativa"],
                    [
                      "sistemas",
                      "División de Sistemas de Gestión Corporativa",
                      [
                        ["calidad", "Gestión de Calidad"],
                        ["mejora", "Mejora Continua"],
                      ],
                    ],
                    ["tecnologia", "División Tecnologías de la Información"],
                    ["mesa", "División Mesa de Servicio"],
                    ["consejo", "Consejo Directivo"],
                    ["administrativa", "Dirección Administrativa"],
                    ["auditoria", "Auditoría Interna"],
                    ["servicios", "Subdirección de Servicios Sociales"],
                    ["educacion", "Subdirección de Educación"],
                    ["financiera", "Subdirección Administrativa y Financiera"],
                    ["revisora", "Revisora Fiscal"],
                  ].map(([value, label, children]) => (
                    <div key={value as string} className="w-full">
                      <TabsTrigger
                        value={value as string}
                        onClick={() =>
                          children
                            ? setOpenCollapse(
                                openCollapse === value
                                  ? null
                                  : (value as string)
                              )
                            : null
                        }
                        className="w-full justify-between items-start px-3 py-2.5 text-sm text-left rounded-md transition-colors flex
                          whitespace-normal break-words leading-tight
                          data-[state=active]:bg-[#e4fef1] data-[state=active]:text-[#11c99d]
                          hover:bg-[#e4fef1]"
                      >
                        <span className="block w-full text-left">{label}</span>
                        {children &&
                          (openCollapse === value ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          ))}
                      </TabsTrigger>

                      {children && openCollapse === value && (
                        <div className="w-full mt-1 space-y-1">
                          {(children as any[]).map(
                            ([childValue, childLabel]) => (
                              <TabsTrigger
                                key={childValue}
                                value={childValue}
                                className="w-full justify-start px-5 py-2 text-sm text-gray-600 rounded-md hover:bg-[#e4fef1] hover:text-[#11c99d] text-left"
                              >
                                {childLabel}
                              </TabsTrigger>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsList>
              </div>
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0 overflow-hidden flex flex-col relative">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              notifications={notifications}
            />
            <BreadcrumbHeader />

            <div className="flex-1 overflow-y-auto p-8">
              {Object.entries(employeesByDivision).map(([key, employees]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  {employees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {employees.map((employee, index) => (
                        <ProfileCard key={index} {...employee} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No hay empleados en esta sección
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </main>
        </Tabs>

        {/* 🔹 Sidebar principal en overlay, no reemplaza contenido */}
        {showMainSidebar && (
          <div className="fixed inset-0 z-50 flex ">
            <Sidebar
              isOpen={true}
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
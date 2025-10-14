"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { BreadcrumbHeader } from "@/components/directory/breadcrumb-header";
import { ProfileCard } from "@/components/directory/profile-card";

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
    {
      name: "Carlos Andrés",
      position: "Mesa Barbosa",
      division: "División de Sistemas de Gestión Corporativo",
      jobTitle: "Jefe División de Sistemas de Gestión Corporativo",
      phone: "Ext. 3892 - 3167448996",
      email: "calidad@cofrem.com.co",
      imageUrl: "/professional-business-person.png",
    },
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
    {
      name: "Ana María",
      position: "López",
      division: "División Tecnologías de la Información",
      jobTitle: "Desarrolladora Senior",
      phone: "Ext. 3894 - 3167448998",
      email: "desarrollo@cofrem.com.co",
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

export default function DirectoryPage() {
  return (
    // 1) Layout responsive: sidebar arriba en móvil, a la izquierda en desktop
    <div className="flex flex-col md:flex-row min-h-screen">
      <Tabs
        defaultValue="sistemas"
        orientation="vertical"
        // 2) Tabs también en flex fila en desktop
        className="flex flex-1 flex-col md:flex-row w-full"
      >
        {/* Sidebar */}
        <aside
          className="
            w-full md:w-64 
            bg-sidebar border-b md:border-b-0 md:border-r border-sidebar-border 
            flex flex-col
            md:sticky md:top-0 md:h-screen
          
          "
        >
          {/* User Profile Section */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  NC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Nombre Completo
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu with TabsList */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-4 px-2">
                <Menu className="h-5 w-5" />
                <span>Menú Principal</span>
              </div>

              <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                {[
                  ["planeacion", "Planeación Corporativa"],
                  ["sistemas", "División de Sistemas de Gestión Corporativa"],
                  ["tecnologia", "División Tecnologías de la Información"],
                  ["mesa", "División Mesa de Servicio"],
                  ["consejo", "Consejo Directivo"],
                  ["administrativa", "Dirección Administrativa"],
                  ["auditoria", "Auditoría Interna"],
                  ["servicios", "Subdirección de Servicios Sociales"],
                  ["educacion", "Subdirección de Educación"],
                  ["financiera", "Subdirección Administrativa y Financiera"],
                  ["revisora", "Revisora Fiscal"],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="
                      w-full justify-start px-3 py-2.5 text-sm text-left
                      leading-tight whitespace-normal break-words
                      rounded-md transition-colors
                      data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium
                      data-[state=inactive]:text-sidebar-foreground hover:bg-sidebar-accent
                    "
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </nav>
        </aside>

        {/* Main Content Area (puede tener cards, tablas, lo que sea) */}
        <main className="flex-1 min-w-0 overflow-y-auto m-0">
          <BreadcrumbHeader />

          {/* Importante: cada contenido puede ser distinto y ancho.
              Por eso envolvemos dentro de un contenedor con overflow-x-auto,
              así una tabla amplia scrollea horizontal sin romper el layout. */}
          <TabsContent value="planeacion" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employeesByDivision.planeacion.map((employee, index) => (
                  <ProfileCard key={index} {...employee} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sistemas" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employeesByDivision.sistemas.map((employee, index) => (
                  <ProfileCard key={index} {...employee} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tecnologia" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employeesByDivision.tecnologia.map((employee, index) => (
                  <ProfileCard key={index} {...employee} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Ejemplo de sección vacía */}
          <TabsContent value="mesa" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay empleados en esta sección</p>
              </div>
            </div>
          </TabsContent>

          {/* El resto pueden tener lo que quieras (tablas, cards, etc.) */}
          <TabsContent value="consejo" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="administrativa" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="servicios" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="educacion" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="financiera" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>

          <TabsContent value="revisora" className="p-8 mt-0">
            <div className="overflow-x-auto">
              <p className="text-muted-foreground">No hay empleados en esta sección</p>
            </div>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}

"use client";
import React, { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { UserProfile } from "@/components/common/user-profile";
import { Document } from "@/types/documents";

interface ManagementSidebarMobileProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  openCollapse: string | null;
  setOpenCollapse: (v: string | null) => void;
  activeCategory: string | null;
  setActiveCategory: (v: string) => void;
  router: any;
  onShowMainSidebar: () => void;
  documents: Document[] | undefined;
  isLoading: boolean;
}

interface ModuleGroup {
  id: string;
  name: string;
  categories: {
    name: string;
    count: number;
  }[];
}

export const ManagementSidebarMobile = ({
  open,
  setOpen,
  openCollapse,
  setOpenCollapse,
  activeCategory,
  setActiveCategory,
  router,
  onShowMainSidebar,
  documents,
  isLoading,
}: ManagementSidebarMobileProps) => {
  // Agrupar documentos por módulo y categoría
  const modulesGrouped = useMemo(() => {
    if (!documents || documents.length === 0) return [];

    // Crear un mapa para agrupar por módulo
    const modulesMap = new Map<string, ModuleGroup>();

    documents.forEach((doc) => {
      const moduleId = doc.field_modulo?.drupal_internal__tid?.toString() || "unknown";
      const moduleName = doc.field_modulo?.name || "Sin módulo";
      const categoryName = doc.field_module_category?.name;

      // Solo incluir documentos que tienen módulo y categoría
      if (!moduleId || moduleId === "unknown" || !categoryName) return;

      // Obtener o crear el módulo
      if (!modulesMap.has(moduleId)) {
        modulesMap.set(moduleId, {
          id: moduleId,
          name: moduleName,
          categories: [],
        });
      }

      const module = modulesMap.get(moduleId)!;

      // Agregar categoría si no existe, contar solo documentos con archivos
      const existingCategory = module.categories.find((cat) => cat.name === categoryName);
      const hasFiles = doc.field_file && doc.field_file.length > 0;
      
      if (existingCategory) {
        // Solo incrementar el contador si el documento tiene archivos
        if (hasFiles) {
          existingCategory.count++;
        }
      } else {
        module.categories.push({
          name: categoryName,
          count: hasFiles ? 1 : 0,
        });
      }
    });

    // Ordenar categorías por nombre
    modulesMap.forEach((module) => {
      module.categories.sort((a, b) => a.name.localeCompare(b.name));
    });

    return Array.from(modulesMap.values());
  }, [documents]);

  return (
    <div className="md:hidden border-b bg-white">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <Image
                src="/icons/logo_cofrem.svg"
                alt="Logo"
                width={100}
                height={30}
                className="h-[40px] w-auto"
              />
            </SheetTitle>
          </SheetHeader>

          <button
            onClick={() => router.push("/profile")}
            className="p-6 border-b border-gray-100 hover:bg-[#2deb7915] transition-colors"
          >
            <UserProfile />
          </button>

          <nav className="flex-1 overflow-y-auto p-4">
            <button
              onClick={() => {
                setOpen(false);
                onShowMainSidebar();
              }}
              className="flex items-center gap-2 text-[#2f8cbd] font-medium mb-4 hover:text-[#11c99d]"
            >
              <Menu className="h-5 w-5" />
              <span>Menú Principal</span>
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2f8cbd]"></div>
              </div>
            ) : modulesGrouped.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>No hay documentos disponibles</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                {modulesGrouped.map((mod) => (
                  <div key={mod.id} className="w-full">
                    {/* Botón principal del módulo */}
                    <button
                      onClick={() => {
                        const newOpenState = openCollapse === mod.id ? null : mod.id;
                        setOpenCollapse(newOpenState);
                        
                        // Si se abre el módulo y no hay categoría activa, seleccionar la primera categoría
                        if (newOpenState === mod.id && mod.categories.length > 0 && !activeCategory) {
                          setActiveCategory(mod.categories[0].name);
                        }
                      }}
                      className={`w-full flex justify-between items-center px-3 py-2.5 text-sm text-left rounded-md transition-colors ${
                        openCollapse === mod.id
                          ? "bg-[#e4fef1] text-[#11c99d]"
                          : "hover:bg-[#e4fef1] text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{mod.name}</span>
                      {openCollapse === mod.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {/* Subcategorías */}
                    {openCollapse === mod.id && (
                      <div className="w-full mt-1 space-y-1 pl-3 border-l border-gray-100">
                        {mod.categories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => {
                              // Abrir el módulo correspondiente si no está abierto
                              if (openCollapse !== mod.id) {
                                setOpenCollapse(mod.id);
                              }
                              setActiveCategory(cat.name);
                              setOpen(false);
                            }}
                            className={`w-full flex justify-between items-center text-left text-sm px-3 py-2 rounded-md transition-colors ${
                              activeCategory === cat.name
                                ? "bg-[#e4fef1] text-[#11c99d] font-medium"
                                : "hover:bg-[#e4fef1] text-gray-700"
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                              {cat.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

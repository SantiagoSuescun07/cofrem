"use client";
import React, { useMemo, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { useDocuments } from "@/queries/management";

interface ManagementContentProps {
  activeModule: string | null;
  activeCategory: string | null;
  setActiveCategory?: (category: string) => void;
}

export const ManagementContent = ({
  activeModule,
  activeCategory,
  setActiveCategory,
}: ManagementContentProps) => {
  const { data: documents, isLoading, error } = useDocuments();

  // Debug: mostrar información de los documentos
  useEffect(() => {
    if (documents) {
      console.log("Documentos obtenidos:", documents.length);
      console.log("Documentos:", documents);
      if (documents.length > 0) {
        console.log("Primer documento:", documents[0]);
        console.log("Categoría activa:", activeCategory);
      }
    }
    if (error) {
      console.error("Error obteniendo documentos:", error);
    }
  }, [documents, error, activeCategory]);

  // TODOS LOS HOOKS DEBEN ESTAR AQUÍ, ANTES DE CUALQUIER RETURN CONDICIONAL

  // Obtener el módulo desde los documentos
  const moduleData = useMemo(() => {
    if (!activeModule || !documents) return null;
    const doc = documents.find(
      (d) => d.field_modulo?.drupal_internal__tid?.toString() === activeModule
    );
    return doc?.field_modulo
      ? {
          id: activeModule,
          name: doc.field_modulo.name || "Sin nombre",
        }
      : null;
  }, [documents, activeModule]);

  // Filtrar documentos por módulo y categoría
  const filteredDocuments = useMemo(() => {
    if (!documents || documents.length === 0) return [];

    let filtered = documents;

    // Filtrar solo documentos que tienen archivos válidos (con URL)
    filtered = filtered.filter((doc) => {
      if (!doc.field_file || doc.field_file.length === 0) return false;
      // Verificar que al menos un archivo tenga URL válida
      return doc.field_file.some((file) => file && file.url && file.url.trim() !== "");
    });

    // Filtrar por módulo si está seleccionado (usar el ID del módulo)
    if (activeModule) {
      filtered = filtered.filter((doc) => {
        const moduleId = doc.field_modulo?.drupal_internal__tid?.toString();
        return moduleId === activeModule;
      });
    }

    // Si hay categoría activa, filtrar por categoría
    if (activeCategory) {
      filtered = filtered.filter((doc) => {
        const categoryName = doc.field_module_category?.name;
        return categoryName === activeCategory;
      });
    }

    return filtered;
  }, [documents, activeModule, activeCategory]);

  // Agrupar documentos por categoría para mostrar estadísticas (solo del módulo activo)
  const documentsByCategory = useMemo(() => {
    if (!documents || !activeModule) return {};
    
    const grouped: Record<string, number> = {};
    documents.forEach((doc) => {
      // Solo contar documentos que tienen archivos válidos (con URL) y pertenecen al módulo activo
      const moduleId = doc.field_modulo?.drupal_internal__tid?.toString();
      const hasValidFiles = doc.field_file && doc.field_file.length > 0 && 
        doc.field_file.some((file) => file && file.url && file.url.trim() !== "");
      
      if (
        moduleId === activeModule &&
        doc.field_module_category?.name &&
        hasValidFiles
      ) {
        const catName = doc.field_module_category.name;
        grouped[catName] = (grouped[catName] || 0) + 1;
      }
    });
    
    return grouped;
  }, [documents, activeModule]);

  // AHORA SÍ PODEMOS HACER RETURNS CONDICIONALES

  // Si no hay módulo seleccionado
  if (!activeModule) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>Selecciona un módulo del sistema de gestión.</p>
      </div>
    );
  }

  // Si el módulo no existe
  if (!moduleData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>Módulo no encontrado.</p>
      </div>
    );
  }

  // Si no hay categoría, mostrar loading mientras se auto-selecciona la primera categoría
  if (!activeCategory) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2f8cbd]"></div>
      </div>
    );
  }

  // Si hay categoría activa, mostramos los PDFs
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2f8cbd]"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay documentos disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 w-[40%] gap-2">
          {filteredDocuments.map((doc) => {
            // Tomar el primer archivo válido del documento (que tenga URL)
            const file = doc.field_file?.find((f) => f && f.url && f.url.trim() !== "");
            
            if (!file || !file.url) return null;

            const isPDF = file.filemime === "application/pdf";

            return (
              <a
                key={doc.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-2.5 border border-gray-200 rounded-lg hover:bg-[#e4fef1] hover:border-[#11c99d] transition-all group"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#11c99d]/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#11c99d]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-gray-900 group-hover:text-[#2f8cbd] transition-colors line-clamp-2">
                      {doc.title}
                    </h4>
                    {file.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {isPDF ? "PDF" : file.filemime.split("/")[1]?.toUpperCase() || "Archivo"}
                    </span>
                    {file.filesize > 0 && (
                      <span className="text-xs text-gray-400">
                        • {(file.filesize / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  <Download className="h-3.5 w-3.5 text-[#2f8cbd] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

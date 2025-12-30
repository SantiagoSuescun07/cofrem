"use client";
import React, { useMemo, useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { useDocuments, useModules } from "@/queries/management";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurePdfViewer } from "@/components/common/secure-pdf-viewer";

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
  const { data: modules } = useModules();
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null);

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
      const beforeModuleFilter = filtered.length;
      filtered = filtered.filter((doc) => {
        const moduleId = doc.field_modulo?.drupal_internal__tid?.toString();
        return moduleId === activeModule;
      });
      console.log(`Filtro por módulo ${activeModule}: ${beforeModuleFilter} -> ${filtered.length} documentos`);
    }

    // Si hay categoría activa, filtrar por categoría usando el ID
    if (activeCategory) {
      const beforeCategoryFilter = filtered.length;
      
      // Buscar el ID de la categoría desde los módulos
      let categoryId: number | null = null;
      
      if (modules && modules.length > 0) {
        // Función recursiva para buscar categoría en módulos y sus subáreas
        const findCategoryRecursive = (items: any[]): number | null => {
          for (const item of items) {
            // Si el item tiene el nombre de la categoría y tiene id, es la categoría buscada
            if (item.name === activeCategory && item.id) {
              return item.id;
            }
            
            // Buscar recursivamente en subáreas
            if (item.subareas && item.subareas.length > 0) {
              const found = findCategoryRecursive(item.subareas);
              if (found !== null) return found;
            }
          }
          return null;
        };
        
        // Buscar en todos los módulos
        for (const module of modules) {
          if (module.categories && module.categories.length > 0) {
            const foundId = findCategoryRecursive(module.categories);
            if (foundId !== null) {
              categoryId = foundId;
              break;
            }
          }
        }
      }
      
      // Filtrar por categoría usando el ID
      filtered = filtered.filter((doc) => {
        const docCategoryId = doc.field_module_category?.drupal_internal__tid;
        
        if (categoryId !== null && docCategoryId !== undefined) {
          // Comparar directamente por ID
          return docCategoryId === categoryId;
        } else {
          // Fallback a comparación por nombre si no encontramos el ID
          const categoryName = doc.field_module_category?.name;
          return categoryName === activeCategory;
        }
      });
      
      console.log(`Filtro por categoría "${activeCategory}" (ID: ${categoryId}): ${beforeCategoryFilter} -> ${filtered.length} documentos`);
      
      // Debug: mostrar información de los documentos filtrados
      if (filtered.length > 0) {
        console.log("Documentos filtrados:", filtered.map(d => ({
          title: d.title,
          category: d.field_module_category?.name,
          categoryId: d.field_module_category?.drupal_internal__tid,
          files: d.field_file?.length || 0
        })));
      } else {
        const moduleDocs = documents.filter(d => {
          const moduleId = d.field_modulo?.drupal_internal__tid?.toString();
          return moduleId === activeModule;
        });
        console.warn("No se encontraron documentos. Documentos del módulo antes del filtro de categoría:", 
          moduleDocs.map(d => ({
            title: d.title,
            category: d.field_module_category?.name,
            categoryId: d.field_module_category?.drupal_internal__tid
          }))
        );
        console.warn("Categorías disponibles en los documentos del módulo:", 
          [...new Set(moduleDocs.map(d => d.field_module_category?.name).filter(Boolean))]
        );
      }
    }

    return filtered;
  }, [documents, activeModule, activeCategory, modules]);

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

  // Función para obtener el ID numérico del documento de Drupal

  // Si no hay módulo seleccionado
  if (!activeModule) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 w-[50%] gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col p-2.5 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si el módulo no existe o está cargando, mostrar skeleton
  if (!moduleData || isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 w-[50%] gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col p-2.5 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay categoría, mostrar skeleton mientras se auto-selecciona la primera categoría
  if (!activeCategory) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 w-[50%] gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col p-2.5 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si hay categoría activa, mostramos los PDFs
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 w-[50%] gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col p-2.5 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay documentos disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 w-[50%] gap-2">
          {filteredDocuments.map((doc) => {
            // Tomar el primer archivo válido del documento (que tenga URL)
            const file = doc.field_file?.find((f) => f && f.url && f.url.trim() !== "");
            
            if (!file || !file.url) return null;

            const isPDF = file.filemime === "application/pdf";
            // Usar drupal_internal__nid que es el ID numérico del nodo en Drupal
            const documentNumericId = doc.drupal_internal__nid;
            const canView = isPDF && documentNumericId !== undefined && documentNumericId !== null;

            const handleClick = (e: React.MouseEvent) => {
              if (canView) {
                e.preventDefault();
                setViewingDocumentId(documentNumericId);
              }
              // Si no es PDF o no tiene ID válido, el link se comporta normalmente
            };

            return (
              <a
                key={doc.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="flex flex-col p-2.5 border border-gray-200 rounded-lg hover:bg-[#e4fef1] hover:border-[#11c99d] transition-all group cursor-pointer"
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
      
      {/* Visor de PDF */}
      {viewingDocumentId && (
        <SecurePdfViewer
          documentId={viewingDocumentId}
          onClose={() => setViewingDocumentId(null)}
        />
      )}
    </div>
  );
};

"use client";
import React, { useMemo, useEffect } from "react";
import { FileText, Download, File } from "lucide-react";
import { useDocuments } from "@/queries/management";
import Image from "next/image";
import { apiBaseUrl } from "@/constants";

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

    // Filtrar solo documentos que tienen archivos
    filtered = filtered.filter((doc) => {
      return doc.field_file && doc.field_file.length > 0;
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
      // Solo contar documentos que tienen archivos y pertenecen al módulo activo
      const moduleId = doc.field_modulo?.drupal_internal__tid?.toString();
      if (
        moduleId === activeModule &&
        doc.field_module_category?.name &&
        doc.field_file &&
        doc.field_file.length > 0
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

  // Si no hay categoría, mostramos resumen del módulo
  if (!activeCategory) {

    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-[#2f8cbd] mb-4">
          {moduleData.name}
        </h2>
        <p className="text-gray-600 mb-6">
          Este módulo contiene las siguientes categorías documentales:
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f8cbd]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(documentsByCategory).length === 0 ? (
              <p className="text-gray-500 text-sm">No hay categorías con documentos en este módulo.</p>
            ) : (
              Object.entries(documentsByCategory).map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setActiveCategory?.(cat)}
                >
                  <span className="text-gray-700 font-medium">{cat}</span>
                  <span className="text-sm text-[#2f8cbd] bg-blue-50 px-3 py-1 rounded-full">
                    {count} {count === 1 ? "documento" : "documentos"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        
        <p className="mt-6 text-gray-500 text-sm">
          Selecciona una categoría del menú lateral para ver sus documentos.
        </p>
      </div>
    );
  }

  // Si hay categoría activa, mostramos los PDFs
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-[#2f8cbd] mb-2">
          {activeCategory}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {isLoading
            ? "Cargando documentos..."
            : `${filteredDocuments.length} ${filteredDocuments.length === 1 ? "documento disponible" : "documentos disponibles"}`}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2f8cbd]"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay documentos disponibles en esta categoría.</p>
            {documents && documents.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 max-w-md mx-auto">
                <p className="mb-2">Total de documentos cargados: {documents.length}</p>
                <p className="mb-2">Categoría buscada: <strong>{activeCategory}</strong></p>
                <details className="mt-2 text-left">
                  <summary className="cursor-pointer text-blue-500 hover:text-blue-700">
                    Ver categorías disponibles en los documentos
                  </summary>
                  <ul className="mt-2 space-y-1 bg-gray-50 p-3 rounded">
                    {Array.from(
                      new Set(
                        documents
                          .map((d) => d.field_module_category?.name)
                          .filter(Boolean)
                      )
                    ).map((cat) => (
                      <li key={cat as string} className="text-xs">- {cat as string}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              // Tomar el primer archivo del documento (generalmente es un PDF)
              const file = doc.field_file?.[0];
              
              if (!file) return null;

              const isPDF = file.filemime === "application/pdf";

              return (
                <a
                  key={doc.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-4 border border-gray-200 rounded-lg hover:bg-[#e4fef1] hover:border-[#11c99d] transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {doc.field_icon ? (
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={doc.field_icon.url}
                          alt={doc.field_icon.alt || doc.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-[#11c99d]/10 flex items-center justify-center">
                        {isPDF ? (
                          <FileText className="h-6 w-6 text-[#11c99d]" />
                        ) : (
                          <File className="h-6 w-6 text-[#11c99d]" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#2f8cbd] transition-colors line-clamp-2">
                        {doc.title}
                      </h4>
                      {file.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {isPDF ? "PDF" : file.filemime.split("/")[1]?.toUpperCase() || "Archivo"}
                      </span>
                      {file.filesize > 0 && (
                        <span className="text-xs text-gray-400">
                          • {(file.filesize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <Download className="h-4 w-4 text-[#2f8cbd] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

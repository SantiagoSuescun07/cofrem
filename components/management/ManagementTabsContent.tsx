"use client";
import React from "react";
import { FileText } from "lucide-react";
import { managementModules } from "@/constants/data";

interface ManagementContentProps {
  activeModule: string | null;
  activeCategory: string | null;
}

export const ManagementContent = ({
  activeModule,
  activeCategory,
}: ManagementContentProps) => {
  // Si no hay módulo seleccionado
  if (!activeModule) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>Selecciona un módulo del sistema de gestión.</p>
      </div>
    );
  }

  // Encontramos el módulo actual
  const moduleData = managementModules.find((m) => m.id === activeModule);

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
        <p className="text-gray-600">
          Este módulo contiene las siguientes categorías documentales:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-1 text-gray-700">
          {moduleData.categories.map((cat) => (
            <li key={cat}>{cat}</li>
          ))}
        </ul>
        <p className="mt-6 text-gray-500 text-sm">
          Selecciona una categoría del menú lateral para ver sus documentos.
        </p>
      </div>
    );
  }

  // Si hay categoría activa, mostramos los PDFs
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#2f8cbd] mb-4">
        {activeCategory}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, j) => (
          <a
            key={j}
            href="https://backoffice.cofrem.com.co/sites/default/files/2025-10/Lorem_ipsum_12_1.pdf"
            target="_blank" 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#e4fef1] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#11c99d]" />
              <span className="text-gray-700">
                Documento ejemplo {j + 1}
              </span>
            </div>
            <span className="text-sm text-[#2f8cbd]">PDF</span>
          </a>
        ))}
      </div>
    </div>
  );
};

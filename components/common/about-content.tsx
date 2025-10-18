"use client";

import { AboutUsNode } from "@/services/about/get-menu";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AboutContentProps {
  section: AboutUsNode | null;
}

export function AboutContent({ section }: AboutContentProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (section) {
      setLoading(true);
      // Simula una carga breve para mejorar UX (puedes quitarlo si el delay viene del backend)
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [section]);

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-r-2xl shadow-md p-8 animate-pulse space-y-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-6 w-1/4 bg-gray-200 rounded mt-8"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6" />
    );
  }

  // 🔹 Contenido real
  const { title, body, field_gallery, field_file } = section;

  return (
    <div className="flex-1 bg-white rounded-r-2xl shadow-md p-8 overflow-y-auto space-y-8">
      <h1 className="text-2xl text-sky-700">{title}</h1>

      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />

      {field_gallery && field_gallery.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl text-sky-600 mb-3">Galería</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {field_gallery.map((img) => (
              <Image
                key={img.target_id}
                src={img.url}
                alt={img.alt}
                width={300}
                height={200}
                className="rounded-xl shadow-sm object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {field_file && field_file.length > 0 && (
        <section>
          <h3 className="text-xl text-sky-600 mb-3">Archivos</h3>
          <div className="flex flex-wrap gap-3">
            {field_file.map((file) => (
              <a
                key={file.target_id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#e63946] font-medium hover:underline"
              >
                <Image
                  src="/icons/pdf-icon.png"
                  alt="PDF"
                  width={20}
                  height={20}
                />
                {file.description || "Documento PDF"}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

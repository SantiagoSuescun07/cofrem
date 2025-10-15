"use client";

import { Button } from "@/components/ui/button";
import { useSinglePublication } from "@/queries/publications";
import {
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/utils/format-date";

export default function SinglePublicationPage({
  params,
}: {
  params: Promise<{ publicationId: string }>;
}) {
  const router = useRouter();
  const { publicationId: id } = use(params);
  const {
    data: publication,
    isLoading,
    isError,
    error,
  } = useSinglePublication(id);

  if (isLoading)
    return <p className="text-gray-500 animate-pulse">Cargando publicación...</p>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!publication?.id) return router.push("/publications");

  return (
    <div className="min-h-screen pb-6 px-6 md:px-10 pt-6">
      {/* Post ocupa todo el ancho disponible */}
      <article className="bg-white shadow rounded-2xl max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {publication.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(publication.created)}</span>
            </div>
          </div>
        </div>

        {/* Imagen principal */}
        {publication.field_image?.url && (
          <div className="relative w-full h-[400px] md:h-[500px] mb-6 rounded-xl overflow-hidden">
            <Image
              src={publication.field_image.url}
              alt={publication.field_image.alt || publication.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Galería tipo Facebook */}
        {publication.field_gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {publication.field_gallery.slice(0, 5).map((img, index) => (
              <div
                key={img.id}
                className="relative w-full h-40 rounded-lg overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={img.alt || "gallery"}
                  fill
                  className="object-cover"
                />
                {/* Overlay contador si hay más imágenes */}
                {index === 4 &&
                  publication.field_gallery.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                      +{publication.field_gallery.length - 5}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Descripción */}
        {publication.description && (
          <div
            className="prose prose-sm md:prose-base max-w-none text-gray-800 mb-6"
            dangerouslySetInnerHTML={{ __html: publication.description }}
          />
        )}

        {/* Links */}
{(publication.field_any_link || publication.field_video_link) && (
  <div className="mb-8 space-y-4">
    {publication.field_any_link && (
      <a
        href={publication.field_any_link}
        target="_blank"
        className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
      >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
          🌐
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
            {publication.field_any_link}
          </p>
          <p className="text-xs text-gray-500">Enlace relacionado</p>
        </div>
      </a>
    )}

    {publication.field_video_link && (
      <a
        href={publication.field_video_link}
        target="_blank"
        className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
      >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-red-100 text-red-600">
          ▶
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-800 group-hover:text-red-600 truncate">
            {publication.field_video_link}
          </p>
          <p className="text-xs text-gray-500">Video relacionado</p>
        </div>
      </a>
    )}
  </div>
)}

        {/* Acciones sociales estilo feed */}
        <div className="flex items-center justify-around border-t pt-4 text-gray-600 text-sm">
          <button className="flex items-center gap-2 hover:text-red-600 transition">
            <Heart className="h-5 w-5" />
            12
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 transition">
            <MessageCircle className="h-5 w-5" />
            8
          </button>
          <button className="flex items-center gap-2 hover:text-green-600 transition">
            <Share2 className="h-5 w-5" />
            Compartir
          </button>
        </div>
      </article>
    </div>
  );
}

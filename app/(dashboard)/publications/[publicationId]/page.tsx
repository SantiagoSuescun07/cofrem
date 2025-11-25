"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSinglePublication } from "@/queries/publications";
import {
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/utils/format-date";
import { GalleryModal } from "@/components/common/gallery-modal";
import { SinglePublicationSkeleton } from "@/components/skeletons/publications/single-publication-skeleton";
import { PublicationContentRenderer } from "@/components/publications/publication-content";
import { Tag } from "lucide-react";
import { RightSidebar } from "@/components/common/right-sidebar";

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

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (isLoading) return <SinglePublicationSkeleton />;

  if (isError) return <div>Error: {error?.message}</div>;
  if (!publication?.id) return router.push("/publications");

  // Combinar imagen principal + galería
  const allImages = [
    ...(publication.field_image ? [publication.field_image] : []),
    ...(publication.field_gallery || []),
  ];

  const openGallery = (index: number) => {
    setStartIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <div className="max-w-8xl mx-auto space-y-8 md:px-10 ">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-h-screen pb-6 px-6 pt-6 bg-gray-50">
          <article className="bg-white shadow rounded-2xl max-w-7xl mx-auto px-6 py-8">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl md:text-2xl text-gray-900">
                  {publication.title || "Publicación"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(publication.created)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft size={16} /> Volver
              </Button>
            </div>

            {/* 🖼️ Mosaico tipo Facebook */}
            {allImages.length > 0 && (
              <div className="mt-6 w-full overflow-hidden rounded-xl">
                <div
                  className={`grid gap-[2px] ${
                    allImages.length === 1
                      ? "grid-cols-1"
                      : allImages.length === 2
                      ? "grid-cols-2"
                      : allImages.length === 3
                      ? "grid-cols-2 grid-rows-2"
                      : "grid-cols-3 grid-rows-2"
                  }`}
                >
                  {allImages.slice(0, 5).map((img, index) => {
                    const isMain = index === 0 && allImages.length > 1;
                    const hasMore = index === 4 && allImages.length > 5;

                    return (
                      <div
                        key={img.id || index}
                        onClick={() => openGallery(index)}
                        className={`relative cursor-pointer overflow-hidden bg-gray-200 group ${
                          isMain ? "col-span-2 row-span-2" : ""
                        }`}
                        style={{
                          minHeight: isMain ? "350px" : "180px",
                          height: "100%",
                        }}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt || "imagen"}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        {hasMore && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-semibold">
                            +{allImages.length - 5}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🔹 Taxonomía (Categorías) */}
            {publication.field_news_category &&
              publication.field_news_category.length > 0 && (
                <div className="mt-6 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {publication.field_news_category.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* 🔹 Descripción */}
            {publication.description && (
              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-800 mb-6 leading-relaxed mt-6"
                dangerouslySetInnerHTML={{ __html: publication.description }}
              />
            )}

            {/* 🔹 Contenido de la publicación (field_options_in_publication) */}
            {/* Esto incluye videos, galerías, enlaces, juegos, texto enriquecido, etc. */}
            {publication.field_options_in_publication && (
              <div className="mt-6 mb-6">
                <PublicationContentRenderer
                  content={publication.field_options_in_publication}
                />
              </div>
            )}

            {/* 🔹 Enlaces */}
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
                      <p className="text-xs text-gray-500">
                        Enlace relacionado
                      </p>
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

            {/* 🔹 Acciones sociales */}
            <div className="flex items-center justify-around border-t pt-4 text-gray-600 text-sm">
              <button className="flex items-center gap-2 hover:text-red-600 transition">
                <Heart className="h-5 w-5" />
                12
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600 transition">
                <MessageCircle className="h-5 w-5" /> 8
              </button>
              <button className="flex items-center gap-2 hover:text-green-600 transition">
                <Share2 className="h-5 w-5" />
                Compartir
              </button>
            </div>
          </article>

          {/* 🔹 Modal de galería */}
          {isGalleryOpen && (
            <GalleryModal
              images={allImages}
              initialIndex={startIndex}
              onClose={() => setIsGalleryOpen(false)}
            />
          )}
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)] lg:overflow-y-auto px-2">
          <RightSidebar onPlayGames={() => router.push("/games")} />
        </div>
      </div>
    </div>
  );
}

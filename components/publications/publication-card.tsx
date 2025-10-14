"use client";

import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { Publication } from "@/types/publications";
import Link from "next/link";

interface Props {
  publication: Publication;
}

export function PublicationCard({ publication }: Props) {
  const { title, field_gallery, field_image } = publication;

  // Tomar máximo 5 imágenes visibles y contar las extra
  const images = [...(field_gallery || [])];
  const visibleImages = images.slice(0, 5);
  const extraCount = images.length > 5 ? images.length - 5 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition mt-14">
      {/* Título */}
      <Link href={`/publications/${publication.id}`} className="text-lg font-semibold text-gray-900 hover:underline hover:text-primary">
        {title}
      </Link>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 gap-2 my-4">
        {/* Imagen principal */}
        {field_image?.url && (
          <div className="col-span-2 row-span-2 relative h-48 rounded-lg overflow-hidden">
            <Image
              src={field_image.url}
              alt={field_image.alt || title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {visibleImages.map((img, index) => (
          <div
            key={img.id}
            className={`relative h-24 rounded-lg overflow-hidden ${
              index === 4 && extraCount > 0 ? "flex items-center justify-center bg-black/60" : ""
            }`}
          >
            {index === 4 && extraCount > 0 ? (
              <span className="text-white text-lg font-semibold">+{extraCount}</span>
            ) : (
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-gray-100 text-xs rounded-full">
          Social
        </span>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <Heart size={16} /> 12
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> 12
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Publication } from "@/types/publications";
import Link from "next/link";
import { GalleryModal } from "../common/gallery-modal";
import Image from "next/image";

interface Props {
  publication: Publication;
}

export function PublicationCard({ publication }: Props) {
  const { title, field_gallery = [], field_image } = publication;

  const images = [
    ...(field_image ? [field_image] : []),
    ...(field_gallery || []),
  ];

  const visibleImages = images.slice(0, 3);
  const extraCount = images.length > 3 ? images.length - 3 : 0;

  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openGallery = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setStartIndex(index);
    setIsOpen(true);
  };

  return (
    <Link
      href={`/publications/${publication.id}`}
      className="block bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition mt-14 cursor-pointer"
    >
      <h3 className="text-lg font-normal text-gray-900 hover:text-primary">
        {title}
      </h3>

      {/* Grid de imágenes */}
      {visibleImages.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            visibleImages.length === 1
              ? "grid-cols-1"
              : "grid-cols-2 grid-rows-2"
          }`}
        >
          {/* Imagen principal */}
          {visibleImages[0] && (
            <div
              className={`relative overflow-hidden rounded-lg cursor-pointer ${
                visibleImages.length > 1 ? "row-span-2" : "h-80"
              }`}
              onClick={(e) => openGallery(e, 0)}
            >
              <Image
                src={visibleImages[0].url}
                alt={visibleImages[0].alt || title}
                fill
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Imágenes secundarias */}
          {visibleImages.slice(1).map((img, index) => {
            const globalIndex = index + 1;
            return (
              <div
                key={img.id || globalIndex}
                className="relative h-40 overflow-hidden rounded-lg cursor-pointer"
                onClick={(e) => openGallery(e, globalIndex)}
              >
                {index === 1 && extraCount > 0 ? (
                  <div>
                    <Image
                      src={img.url}
                      alt={img.alt || title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-2xl font-semibold rounded-lg">
                      +{extraCount}
                    </div>
                  </div>
                ) : (
                  <Image
                    src={img.url}
                    alt={img.alt || title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
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

      {/* Modal de galería */}
      {isOpen && (
        <GalleryModal
          images={images}
          initialIndex={startIndex}
          onClose={() => setIsOpen(false)}
        />
      )}
    </Link>
  );
}

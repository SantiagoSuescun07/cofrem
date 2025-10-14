"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBanner } from "@/queries/banner";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroSection: React.FC = () => {
  const { data: banner, isLoading, isError } = useBanner();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayDuration = 5000;

  useEffect(() => {
    if (!isAutoPlaying || !banner?.field_gallery?.length) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banner.field_gallery.length);
    }, autoPlayDuration);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banner?.field_gallery?.length]);

  const nextSlide = () => {
    if (!banner?.field_gallery?.length) return;
    setCurrentSlide((prev) => (prev + 1) % banner.field_gallery.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    if (!banner?.field_gallery?.length) return;
    setCurrentSlide(
      (prev) =>
        (prev - 1 + banner.field_gallery.length) %
        banner.field_gallery.length
    );
    setIsAutoPlaying(false);
  };

  /** ✅ Skeleton elegante mientras carga */
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[290px]">
        <Skeleton className="absolute inset-0 rounded-2xl h-full w-full" />
        <div className="absolute inset-0 flex justify-between items-center px-2 z-10">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  /** ⚠️ Error o sin datos */
  if (isError || !banner) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-red-500">
        No se pudo cargar el banner.
      </div>
    );
  }

  const slides = banner.field_gallery;

  /** ✅ Banner final con transición fade */
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[290px]">
        {/* Contenedor de imágenes (fade sin desmontaje) */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 1 : 0,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slide.url}
                alt={slide.alt || "Banner"}
                fill
                className="object-cover rounded-2xl transition-transform duration-700"
                priority={index === currentSlide}
              />
            </motion.div>
          ))}
        </div>

        {/* Controles */}
        <div className="absolute inset-0 z-20 flex justify-between items-center px-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/80 shadow hover:bg-white"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/80 shadow hover:bg-white"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </motion.button>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-blue-500" : "bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Botón play/pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow hover:bg-white z-30"
        >
          {isAutoPlaying ? (
            <Pause className="text-blue-500 size-4" />
          ) : (
            <Play className="text-blue-500 size-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

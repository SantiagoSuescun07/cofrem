"use client"

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bell,
  Play,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Tipos de datos simulados (reemplaza con tus tipos reales)
interface User {
  name: string;
  role: string;
  area: string;
}

interface HeroSectionProps {
  currentUser: User;
  currentTime: Date;
}

interface Slide {
  id: number;
  image?: string;
  type: "welcome" | "stats" | "notifications";
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  gradient: string;
  icon: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayDuration = 5000; // 5 segundos por slide

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const slides: Slide[] = [
    {
      id: 2,
      type: "stats",
      title: "Resumen de Rendimiento",
      subtitle: "Métricas del mes actual",
      gradient: "from-emerald-50 to-teal-50 border-emerald-100",
      image: "/images/banner1.jpg",
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">87%</div>
            <div className="text-xs text-gray-500">Productividad</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-xs text-gray-500">Proyectos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-xs text-gray-500">Calificación</div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      type: "notifications",
      title: "Recordatorios Importantes",
      subtitle: "No olvides estas tareas",
      gradient: "from-purple-50 to-pink-50 border-purple-100",
      icon: <Bell className="w-6 h-6 text-purple-600" />,
      image: "/images/banner3.jpg",
      content: (
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
            <span className="text-gray-600">
              Reunión de equipo a las 3:00 PM
            </span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Revisar informes pendientes</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Evaluación de desempeño</span>
          </div>
        </div>
      ),
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayDuration);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative">
      {/* Main Banner Container */}
      <div
        className={`bg-gradient-to-r bg-muted rounded-2xl p-8 border relative overflow-hidden min-h-[290px] flex items-center shadow-xl shadow-neutral-200`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 h-full w-full z-0"
          >
            <Image
              src={slides[currentSlide].image || "/images/banner-default.jpg"}
              alt="Banner Image"
              fill
              className="object-cover size-full rounded-r"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-2 flex items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors duration-200"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </motion.button>
        </div>

        <div className="absolute inset-y-0 right-2 flex items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors duration-200"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </motion.button>
        </div>

        {/* Slide Content */}
        <div className="mx-12 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center justify-center"
            >
              {/* Content Section */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center mb-3"
                >
                  {/* {slides[currentSlide].icon} */}
                  <h1 className="text-3xl font-bold text-gray-900">
                    {slides[currentSlide].title}
                  </h1>
                </motion.div>

                {slides[currentSlide].subtitle && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-gray-600 mb-4"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  {slides[currentSlide].content}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Dots */}
      {/* <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, index) => (
          <div key={index} className="relative">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToSlide(index)}
              className={`w-12 h-2 rounded-full transition-colors duration-300 ${
                index === currentSlide ? "bg-blue-400" : "bg-gray-200"
              }`}
            >
              {index === currentSlide && isAutoPlaying && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: autoPlayDuration / 1000,
                    ease: "linear",
                  }}
                  className="h-full bg-blue-600 rounded-full"
                />
              )}
            </motion.button>
          </div>
        ))}
      </div> */}

      {/* Auto-play Control */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors duration-200 text-xs"
      >
        {isAutoPlaying ? (
          <Pause className="text-blue-400 size-3.5" />
        ) : (
          <Play className="text-blue-400 size-3.5" />
        )}
      </motion.button>
    </div>
  );
};

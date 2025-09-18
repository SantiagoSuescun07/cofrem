"use client";

import React, { useState } from "react";
import { useNews } from "@/queries/news";
import { NewsCard } from "@/components/news/news-card";
import { NewsPageSkeleton } from "@/components/skeletons/news/news-page-skeleton";
import { Pagination } from "@/components/common/pagination";
import { motion, AnimatePresence, Variants, cubicBezier } from "framer-motion";

export default function NewsPage() {
  const [page, setPage] = useState(1);
  const { data: news, isLoading } = useNews();

  if (isLoading) return <NewsPageSkeleton />;

  const limit = 10;
  const totalItems = news?.items.length || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedItems =
    news?.items.slice((page - 1) * limit, page * limit) || [];

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: cubicBezier(0.25, 0.1, 0.25, 1),
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };
  return (
    <div className="relative">
      <div className="container mx-auto pt-6">
        {/* Título con animación */}
        <h2 className="text-3xl font-bold text-[#151515] mb-8">
          Portal de Noticias
        </h2>

        {/* Lista de noticias animada */}
        <motion.div
          key={page} // clave cambia cuando se cambia de página => anima la transición
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-2 2xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {paginatedItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                exit="exit"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Paginación */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

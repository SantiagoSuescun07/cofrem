"use client";

import React, { useState } from "react";
import { useNews } from "@/queries/news";
import { NewsCardSkeleton } from "../skeletons/news/news-card-skeleton";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
} from "@/constants/animation.-variants";
import { Pagination } from "./pagination";
import { NewsCard } from "../news/news-card";

export function NewsSection() {
  const [page, setPage] = useState(1);
  const { data: news, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const limit = 10;
  const totalItems = news?.items.length || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedItems =
    news?.items.slice((page - 1) * limit, page * limit) || [];

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Últimas Noticias
        </h2>
        <Link
          href="/news"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          Ver todas
        </Link>
      </div>
      <motion.div
        key={page}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
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
  );
}

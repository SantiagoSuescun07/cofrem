"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSingleNews } from "@/queries/news";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { ArticleHeader } from "./_components/article-header";
import { useRouter } from "next/navigation";
import { SingleNewsPageSkeleton } from "@/components/skeletons/news/single-news-page-skeleton";
import { ArticleMainImage } from "./_components/article-main-image";
import { ArticleFile } from "./_components/article-file";
import { ArticleGallery } from "./_components/article-gallery";
import { ArticleComments } from "./_components/article-comments";
import { cubicBezier, motion } from "framer-motion";

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.25, 0.1, 0.25, 1), // ✔️ TS lo acepta
    },
  },
};

export default function SingleNewsPage({
  params,
}: {
  params: Promise<{ newsId: string }>;
}) {
  const router = useRouter();

  const { newsId: id } = use(params);
  const { data: news, isLoading, isError, error } = useSingleNews(id as string);

  if (isLoading) return <SingleNewsPageSkeleton />;
  if (isError) return <div>Error: {error?.message}</div>;
  if ((!isLoading && !news) || (!isLoading && !news?.id))
    return router.push("/news");

  return (
    <motion.div
      className="min-h-screen bg-background rounded-xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Link href="/news">
            <Button
              variant="ghost"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a noticias
            </Button>
          </Link>
        </motion.div>

        {/* Main image */}
        <motion.div variants={itemVariants}>
          <ArticleMainImage news={news!} />
        </motion.div>

        {/* Article header */}
        <motion.div variants={itemVariants}>
          <ArticleHeader news={news!} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Separator className="mb-8" />
        </motion.div>

        {/* Main content */}
        <motion.div
          className="prose prose-lg max-w-none mb-8"
          variants={itemVariants}
        >
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: news?.body! }}
          />
        </motion.div>

        {/* File */}
        {news?.field_file_new && news?.field_file_new.display && (
          <motion.div variants={itemVariants}>
            <ArticleFile news={news!} />
          </motion.div>
        )}

        {/* Gallery */}
        {news!.field_gallery.length > 0 && (
          <motion.div variants={itemVariants}>
            <ArticleGallery news={news!} />
          </motion.div>
        )}

        {/* Comments section */}
        <motion.div variants={itemVariants}>
          <ArticleComments news={news!} newsId={id!} />
        </motion.div>
      </div>
    </motion.div>
  );
}

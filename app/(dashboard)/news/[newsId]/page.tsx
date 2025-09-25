"use client";

import { Button } from "@/components/ui/button";
import { useSingleNews } from "@/queries/news";
import { ArrowLeft, Calendar, MessageCircle, User, Eye } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { SingleNewsPageSkeleton } from "@/components/skeletons/news/single-news-page-skeleton";
import Image from "next/image";
import { formatDate } from "@/utils/format-date";
import { ArticleFile } from "./_components/article-file";
import { ArticleComments } from "./_components/article-comments";
import { ArticleCarousel } from "./_components/article-carousel";

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
  if (!news?.id) return router.push("/news");

  return (
    <div className="min-h-screen bg-muted/30 md:pb-10 md:px-4">
      <article className="container mx-auto bg-white rounded-2xl shadow-md p-6 md:p-10">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/news">
            <Button
              variant="ghost"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a noticias
            </Button>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">
          {news.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(news.created)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{news.comments.comment_count} comentarios</span>
          </div>
          {news.comments.last_comment_name && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Último comentario: {news.comments.last_comment_name}</span>
            </div>
          )}
        </div>

        {/* Body with main image floated */}
        <div className="prose prose-lg max-w-none mb-10 leading-relaxed">
          {news.field_main_image && (
            <Image
              src={news.field_main_image.url || "/placeholder.svg"}
              alt={news.field_main_image.alt || news.title}
              width={400}
              height={300}
              className="w-full mb-6 rounded-lg shadow-md object-cover md:float-right md:ml-6 md:mb-4 md:max-w-[50%]"
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: news.body }} />
        </div>

        {/* Gallery as carousel */}
        {news.field_gallery.length > 0 && (
          <div className="mb-12 md:mt-20">
            <h3 className="text-2xl font-semibold mb-4">Galería</h3>
            <ArticleCarousel
              images={news.field_gallery.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
              }))}
            />
          </div>
        )}

        {/* File */}
        {news.field_file_new?.display && <ArticleFile news={news} />}

        {/* Comments */}
        <ArticleComments news={news} newsId={id!} />
      </article>
    </div>
  );
}

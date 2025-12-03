"use client";

import { useSingleNews } from "@/queries/news";
import { use } from "react";
import { useRouter } from "next/navigation";
import { SingleNewsPageSkeleton } from "@/components/skeletons/news/single-news-page-skeleton";
import Image from "next/image";
import { ArticleFile } from "./_components/article-file";
import { ArticleComments } from "./_components/article-comments";
import { ArticleCarousel } from "./_components/article-carousel";
import { ProgressBar } from "@/components/common/progress-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const formattedDate = new Date(news.created).toISOString().split("T")[0];

  return (
    <div className="md:pb-10 px-6 md:px-10 pt-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/news" className="flex items-center gap-3">Noticias <ProgressBar /></BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="min-h-screen bg-muted/30">
        <article className="container mx-auto bg-white rounded-2xl shadow-md p-6 md:p-10">
          {/* Title */}
          <h1 className="text-2xl md:text-4xl mb-4">{news.title}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-lg text-[#76b9d7] mb-8">
            <div className="flex items-center gap-1">
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Body with main image floated */}
          <div className="prose prose-lg max-w-none mb-10 leading-relaxed">
            {news.field_main_image && (
              <Image
                src={news.field_main_image.url || "/placeholder.svg"}
                alt={news.field_main_image.alt || news.title}
                width={400}
                height={300}
                className="w-full mb-6 rounded-3xl  object-cover  md:float-right md:ml-6 md:mb-4 md:max-w-[45%] md:h-52"
              />
            )}
            <div dangerouslySetInnerHTML={{ __html: news.body }} />
            <div className="clear-both" />
          </div>

          {/* Gallery as carousel */}
          {news.field_gallery.length > 0 && (
            <div className="mb-12 md:mt-20">
              <h3 className="flex items-center text-2xl mb-4">
                <Image
                  src="/icons/blue-image.png"
                  alt="Image icon"
                  width={40}
                  height={40}
                  priority
                  className="size-[23px] mr-2"
                />{" "}
                <span className="mr-3">Galería</span>
                <ProgressBar />
              </h3>
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
    </div>
  );
}

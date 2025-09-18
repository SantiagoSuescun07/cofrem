"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, ArrowRight, Eye } from "lucide-react";
import Image from "next/image";
import { News } from "@/types/news/news";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/format-date";

interface NewsCardProps {
  news: News;
  onReadMore?: (id: string) => void;
}

export function NewsCard({ news, onReadMore }: NewsCardProps) {
  const router = useRouter();

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 120) + "...";
  };

  return (
    <Card
      onClick={() => router.push(`/news/${news.id}`)}
      className="group w-full max-w-md overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-2xl shadow-lg py-0 cursor-pointer"
    >
      <CardHeader className="p-0 relative">
        {news.field_main_image && (
          <div className="relative h-52 w-full overflow-hidden">
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 opacity-20" />

            <Image
              src={news.field_main_image.url || "/placeholder.svg"}
              alt={news.field_main_image.alt || news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Photo count badge */}
            {news.field_gallery.length > 0 && (
              <Badge className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white border-0 z-20 font-medium">
                +{news.field_gallery.length} fotos
              </Badge>
            )}

            {/* Floating segmentation badges */}
            {news.field_segmentation.length > 0 && (
              <div className="hidden md:block absolute -bottom-2 left-6 right-6 bg-white rounded-t-xl p-4 shadow-xl border border-gray-100 z-20">
                <div className="flex flex-wrap gap-2">
                  {news.field_segmentation.slice(0, 2).map((segment) => (
                    <Badge
                      key={segment.id}
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-colors"
                    >
                      {segment.name}
                    </Badge>
                  ))}
                  {news.field_segmentation.length > 2 && (
                    <Badge className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                      +{news.field_segmentation.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 px-6 pb-6">
        <div className="space-y-4">
          <div className="md:hidden flex flex-wrap gap-2">
            {news.field_segmentation.slice(0, 2).map((segment) => (
              <Badge
                key={segment.id}
                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-colors"
              >
                {segment.name}
              </Badge>
            ))}
            {news.field_segmentation.length > 2 && (
              <Badge className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                +{news.field_segmentation.length - 2}
              </Badge>
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {news.title}
          </h3>

          {/* Extracto del contenido */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {stripHtml(news.body)}
          </p>

          {/* Estado de publicación */}
          {news.field_publication_statuses && (
            <div>
              <Badge className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {news.field_publication_statuses.name}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
          {/* Información adicional */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(news.created)}</span>
            </div>

            {news.comments.comment_count > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{news.comments.comment_count}</span>
              </div>
            )}
          </div>

          {/* Botón de leer más */}
          <button
            className="group/btn flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200"
            onClick={() => onReadMore?.(news.id)}
          >
            <span>Leer más</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

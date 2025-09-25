"use client";

import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { News } from "@/types/news/news";
import { formatDate } from "@/utils/format-date";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewsCardProps {
  news: News;
  onReadMore?: (id: string) => void;
}

export function NewsCard({ news, onReadMore }: NewsCardProps) {
  const router = useRouter();

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
  };

  return (
    <div
      onClick={() => router.push(`/news/${news.id}`)}
      className="relative flex flex-col sm:flex-row gap-4 w-full border rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
    >
      {/* Image with badge */}
      <div className="relative w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden">
        {news.field_main_image && (
          <Image
            src={news.field_main_image.url || "/placeholder.svg"}
            alt={news.field_main_image.alt || news.title}
            fill
            className="object-cover"
          />
        )}
        {/* Category badge */}
        {news.field_segmentation.length > 0 && (
          <Badge className="absolute top-2 left-2 bg-gray-200 text-gray-800 rounded-full px-3 py-0.5 text-xs font-medium">
            {news.field_segmentation[0].name}
          </Badge>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Fecha arriba a la derecha */}
        <div className="text-right text-sm text-gray-500">
          {formatDate(news.created)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {news.title}
        </h3>

        {/* Resume */}
        <p className="text-gray-600 text-sm flex-1">{stripHtml(news.body)}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>12</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{news.comments.comment_count || 0}</span>
            </div>
          </div>
          <Link
            href={`/news/${news.id}`}
            className="text-gray-700 hover:underline"
          >
            Leer más...
          </Link>
        </div>
      </div>
    </div>
  );
}

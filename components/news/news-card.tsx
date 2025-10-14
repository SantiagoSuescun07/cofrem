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
}

export function NewsCard({ news }: NewsCardProps) {
  const router = useRouter();

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
  };

  const formattedDate = new Date(news.created).toISOString().split("T")[0];

  return (
    <div
      onClick={() => router.push(`/news/${news.id}`)}
      className="relative w-full border rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
    >
      <div className="flex items-center justify-between mb-4">
        {/* Category badge */}
        {news.field_segmentation.length > 0 && (
          <Badge className="bg-[#daebff] text-[#335d79] rounded-full px-3 py-1.5 text-xs font-medium">
            {news.field_segmentation[0].name}
          </Badge>
        )}

        {/* Fecha arriba a la derecha */}
        <div className="text-right text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg mb-2">{news.title}</h3>

          {/* Resume */}
          <p className="text-gray-600 text-sm flex-1">{stripHtml(news.body)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Heart className="size-5 stroke-2 text-[#8fd0e2]" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="size-5 stroke-2 text-[#8fd0e2]" />
            <span>{news.comments.comment_count || 0}</span>
          </div>
        </div>
        <Link
          href={`/news/${news.id}`}
          className="text-[#24b0d6] font-semibold hover:underline"
        >
          Leer más...
        </Link>
      </div>
    </div>
  );
}

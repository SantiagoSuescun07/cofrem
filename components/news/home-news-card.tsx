import { News } from "@/types/news/news";
import { Heart, MessageCircle } from "lucide-react";
import { ProgressBar } from "../common/progress-bar";
import Image from "next/image";
import Link from "next/link";

interface HomeNewsCardProps {
  news: News;
  onLike?: () => void;
  onViewMore?: () => void;
  likesCount?: number;
  isLiked?: boolean;
}

export function HomeNewsCard({
  news,
  onLike,
  onViewMore,
  likesCount = 0,
  isLiked = false,
}: HomeNewsCardProps) {
  const mainImage = news.field_main_image?.url || "";
  const commentsCount = news.comments.comment_count;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/blue-news.png"
              alt="News icon"
              width={40}
              height={40}
              priority
              className="size-[25px] object-cover"
            />
            <h3 className="text-2xl">Noticias</h3>
          </div>
          <ProgressBar />
        </div>

        <h2 className="text-gray-700 text-sm leading-relaxed mb-4">
          {news.title}
        </h2>

        {mainImage && (
          <div className="rounded-xl overflow-hidden mb-4">
            <Image
              src={mainImage}
              alt={news.field_main_image?.alt || news.title}
              width={400}
              height={256}
              priority
              className="w-full h-72 object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {news.field_segmentation.length > 0 && (
              <span className="text-xs text-[#335d79] font-medium px-3 py-1.5 bg-[#daebff] rounded-full">
                {news.field_segmentation[0].name}
              </span>
            )}

            <Link
              href={`/news/${news.id}`}
              onClick={onViewMore}
              className="bg-[#00a2f1] hover:bg-[#0085c8] text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              Ver más
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-500 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "fill-cyan-500 text-cyan-500" : ""
                }`}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center gap-1.5 text-gray-600 hover:text-cyan-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

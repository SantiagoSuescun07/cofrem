import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { News } from "@/types/news/news";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleFileProps {
  news: News;
}

export function ArticleFile({ news }: ArticleFileProps) {
  return (
    <Card className="mb-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition bg-background">
      <CardContent className="px-6 py-4 flex items-center justify-between">
        {/* Info del archivo */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
            <h3 className="font-semibold text-base text-foreground">
              Archivo adjunto
            </h3>
          <div>
            <p className="text-muted-foreground text-sm mt-1">
              {news?.field_file_new?.description}
            </p>
          </div>
        </div>

        {/* Botón de descarga */}
        <Button
          asChild
          className="rounded-full px-5 py-2 gap-2 bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        >
          <Link target="_blank" href={news?.field_file_new?.url!} download>
            <Download className="h-4 w-4" />
            Descargar
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

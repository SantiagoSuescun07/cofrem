import { ChevronRight } from "lucide-react";
import { ProgressBar } from "../common/progress-bar";

export function BreadcrumbHeader() {
  return (
    <div className="border-b border-border bg-card px-8 py-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-foreground">Inicio</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">Directorio</span>
        <ProgressBar />
      </div>
    </div>
  );
}

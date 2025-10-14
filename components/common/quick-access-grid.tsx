// components/dashboard/QuickAccessGrid.tsx
import React from "react";
import { QuickAccessCard } from "@/components/common/quick-access-card";
import { QuickAccessItem } from "@/types";
import { ProgressBar } from "./progress-bar";

interface QuickAccessGridProps {
  quickAccessData: QuickAccessItem[];
  onItemClick?: (item: QuickAccessItem) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  quickAccessData,
  onItemClick,
}) => {
  const handleItemClick = (item: QuickAccessItem): void => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      console.log(`Clicked: ${item.name}`);
    }
  };

  return (
    <div className="mt-20">
      <h2 className="flex items-center gap-3 text-xl text-[#323c45] mb-6">
        Servicios en línea <ProgressBar />
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {quickAccessData.map((item, index) => (
          <QuickAccessCard
            key={`${item.name}-${index}`}
            item={item}
            onClick={handleItemClick}
          />
        ))}
      </div>
    </div>
  );
};

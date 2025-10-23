import React, { useState } from "react";
import { ProgressBar } from "./progress-bar";
import { useDigitalServicesQuery } from "@/queries/digital-services";
import Link from "next/link";
import Image from "next/image";

export const QuickAccessGrid = () => {
  const { data: quickAccessData } = useDigitalServicesQuery();
  const [showAll, setShowAll] = useState(false);

  // Mostrar solo 8 si no se ha presionado "Ver más"
  const displayedServices = showAll
    ? quickAccessData
    : quickAccessData?.slice(0, 8);

  return (
    <div className="mt-20 text-center">
      <h2 className="flex items-center gap-3 text-xl text-[#323c45] mb-6">
        Servicios en línea <ProgressBar />
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-items-center">
        {displayedServices?.map((access) => (
          <Link
            key={access.id}
            href={access.link}
            target={access.newTab ? "_blank" : "_self"}
            className="flex flex-col gap-2 items-center justify-center group bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 w-full max-w-[180px]"
          >
            <Image
              src={access.icon?.url ?? ""}
              alt={access.title}
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-sm font-medium text-gray-700 text-center">
              {access.title}
            </span>
          </Link>
        ))}
      </div>

      {quickAccessData && quickAccessData.length > 8 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-6 px-5 py-2 text-sm font-medium text-[#0066cc] hover:underline transition-all"
        >
          {showAll ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
};

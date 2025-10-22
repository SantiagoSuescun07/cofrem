import React from "react";
import { ProgressBar } from "./progress-bar";
import { useDigitalServicesQuery } from "@/queries/digital-services";
import Link from "next/link";
import Image from "next/image";

export const QuickAccessGrid = () => {
  const { data: quickAccessData } = useDigitalServicesQuery();

  return (
    <div className="mt-20">
      <h2 className="flex items-center gap-3 text-xl text-[#323c45] mb-6">
        Servicios en línea <ProgressBar />
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {quickAccessData?.map((access) => (
          <Link
            key={access.id}
            href={access.link}
            target={access.newTab ? "_blank" : "_self"}
            className="flex flex-col gap-2 items-center justify-center group bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 w-full"
          >
            <Image
              src={access.icon?.url ?? ""}
              alt="Icon"
              width={40}
              height={40}
              className="size-[40px] object-conver"
            />
            {access.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

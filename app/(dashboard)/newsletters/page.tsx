"use client";

import React from "react";
import { NewslettersBreadcrumb } from "./_components/newsletters-breadcrumb";
import { useNewsletters } from "@/queries/newsletters";
import { NewsletterCard } from "./_components/newsletter-card";
import { NewsletterCardSkeleton } from "./_components/newsletter-card-skeleton";

export default function NewslettersPage() {
  const { data: newsletters, isLoading } = useNewsletters();

  console.log(newsletters);

  return (
    <div className="relative">
      <div className="container mx-auto pt-6">
        <NewslettersBreadcrumb />

        <h2 className="text-3xl font-bold text-[#151515] mb-8">
          Portal de Boletines
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsletterCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {newsletters?.map((report) => (
              <NewsletterCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

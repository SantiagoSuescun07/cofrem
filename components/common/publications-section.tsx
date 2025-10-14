"use client";

import React from "react";
import { usePublications } from "@/queries/publications";
import { PublicationCardSkeleton } from "../skeletons/publications/publication-card-skeleton";
import { PublicationCard } from "../publications/publication-card";

export function PublicationsSection() {
  const { data: publications, isLoading } = usePublications();

  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <PublicationCardSkeleton key={i} />
            ))
          : publications?.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
      </div>
    </div>
  );
}

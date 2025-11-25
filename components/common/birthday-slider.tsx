"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useCallback } from "react";
import { useBirthdayQuery } from "@/queries/birthday";
import { User } from "lucide-react";
import Image from "next/image";
import { BirthdayModal } from "./birthday-modal";
import { Birthday } from "@/services/birthday/get-birthdays";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "../ui/card";

export function BirthdaySlider() {
  const { data: birthdays = [], isLoading } = useBirthdayQuery();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date().toISOString().slice(5, 10); // MM-DD
  const todayBirthdays = birthdays.filter(b => b.field_birthdate?.slice(5, 10) === today);

  // dividir en grupos de 2
  const grouped = [];
  for (let i = 0; i < todayBirthdays.length; i += 2) {
    grouped.push(todayBirthdays.slice(i, i + 2));
  }

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) return <BirthdaySliderSkeleton />;

  if (todayBirthdays.length === 0)
    return (
      <div className="bg-white p-3 border rounded-xl">
        <h3 className="text-lg mb-2">Cumpleaños de Hoy</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay cumpleaños hoy 🎈
        </p>
      </div>
    );

  return (
    <div className="bg-white p-3 border rounded-xl">
      <h3 className="text-lg mb-4">Cumpleaños de Hoy</h3>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {grouped.map((pair, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] flex flex-col gap-4 px-1"
            >
              {pair.map((person, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedBirthday(person);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg cursor-pointer hover:bg-[#e2e8f0] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2deb79]/20 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    {person.profileImage ? (
                      <Image
                        src={person.profileImage}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <User className="text-[#2deb79] h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {person.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {person.area || "Área no especificada"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-3 gap-2">
        {grouped.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? "bg-[#2deb79]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Modal de cumpleaños */}
      <BirthdayModal
        birthday={selectedBirthday}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBirthday(null);
        }}
      />
    </div>
  );
}

function BirthdaySliderSkeleton() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="overflow-hidden">
        <div className="flex gap-4">
          {Array.from({ length: 1 }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="flex-[0_0_100%] flex flex-col gap-4 px-1"
            >
              {Array.from({ length: 1 }).map((_, cardIndex) => (
                <div
                  key={`${slideIndex}-${cardIndex}`}
                  className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg"
                >
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-3 gap-2">
        {Array.from({ length: 1 }).map((_, index) => (
          <Skeleton key={index} className="w-2 h-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}

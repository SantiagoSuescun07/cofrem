"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/axios";
import { ProgressBar } from "@/components/common/progress-bar";

// --------------------
// 🔹 Tipos de datos
// --------------------
interface FileData {
  id: string;
  attributes: {
    filename: string;
    uri: {
      url: string;
    };
  };
}

interface MagazineData {
  id: string;
  attributes: {
    title: string;
    field_edition_number: number;
    field_publish_date: string;
    field_any_link: {
      uri: string;
      title: string;
    };
  };
  relationships?: {
    field_image?: {
      links?: {
        related?: {
          href: string;
        };
      };
    };
  };
}

interface MagazineResponse {
  data: MagazineData[];
}

// 🔹 Tipo extendido con imagen cargada
export interface MagazineWithImage extends MagazineData {
  image: {
    filename: string;
    url: string;
  };
}

// --------------------
// 🔹 Servicio de fetch
// --------------------
async function fetchMagazines(): Promise<MagazineWithImage[]> {
  const response = await api.get<MagazineResponse>(
    "/jsonapi/node/magazine_link",
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const magazines = response.data.data;

  // Para cada revista, obtener la imagen relacionada
  const withImages: MagazineWithImage[] = await Promise.all(
    magazines.map(async (mag) => {
      const imageHref = mag.relationships?.field_image?.links?.related?.href;
      let filename = "";
      let imageUrl = "";

      if (imageHref) {
        try {
          const imgResponse = await api.get(imageHref);
          const fileData = imgResponse.data?.data as FileData;
          filename = fileData?.attributes?.filename || "";
          imageUrl = fileData?.attributes?.uri?.url
            ? `https://backoffice.cofrem.com.co${fileData.attributes.uri.url}`
            : "";
        } catch (err) {
          console.error("Error cargando imagen:", err);
          filename = "Sin imagen";
        }
      }

      return {
        ...mag,
        image: { filename, url: imageUrl },
      };
    })
  );

  return withImages;
}

// --------------------
// 🔹 Página principal
// --------------------
export default function MagazinesPage() {
  const { data, isLoading, isError } = useQuery<MagazineWithImage[], Error>({
    queryKey: ["magazines"],
    queryFn: fetchMagazines,
  });

  const magazines = data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-foreground font-medium flex justify-center items-center gap-3">
              Revista Enlace {" "}
              <div className="flex justify-center items-center">
                <ProgressBar />
              </div>
            </span>
          </div>
          <div className="h-1 w-24 bg-blue-500 rounded-full" />
        </div>

        {/* Error */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-destructive">
              Error al cargar las revistas. Por favor, intenta de nuevo.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Grid de revistas */}
        {!isLoading && magazines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {magazines.map((magazine) => (
              <Card
                key={magazine.id}
                className="overflow-hidden hover:shadow-lg transition-shadow p-0"
              >
                <CardContent className="p-0">
                  {/* Imagen */}
                  {magazine.image.url ? (
                    <Image
                      src={magazine.image.url}
                      alt={magazine.image.filename || magazine.attributes.title}
                      width={400}
                      height={300}
                      className="object-cover w-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Sin imagen
                    </div>
                  )}

                  {/* Información */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">
                      {magazine.attributes.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Edición #{magazine.attributes.field_edition_number} —{" "}
                      {magazine.attributes.field_publish_date}
                    </p>
                    {magazine.image.filename && (
                      <p className="text-xs text-muted-foreground italic mb-4">
                        Archivo: {magazine.image.filename}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-0 h-auto font-normal group"
                      asChild
                    >
                      <a
                        href={magazine.attributes.field_any_link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver revista
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && magazines.length === 0 && !isError && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron revistas.
          </div>
        )}
      </div>
    </div>
  );
}

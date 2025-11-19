"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/user-current-user";
import { useUserProfile } from "@/queries/profile";
import { useEffect, useState } from "react";

// Hook personalizado para obtener el userId de forma segura
function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cofrem.user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserId(parsed?.uid || null);
        }
      } catch (error) {
        console.error("Error al leer localStorage:", error);
      }
    }
  }, []);

  return userId;
}

// Componente de skeleton para la card de perfil
function ProfileSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="size-32 md:size-56 rounded-xl" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Card className="bg-white overflow-hidden w-full py-6">
        <CardContent className="px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-7 w-48" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfileInfo() {
  const userId = useUserId();
  const user = useCurrentUser();
  const { data: profile, isLoading } = useUserProfile(userId!);

  // Mostrar skeleton mientras carga el userId o el perfil
  if (!userId || isLoading) {
    return <ProfileSkeleton />;
  }

  const initials = (profile?.name || user?.name)
    ? (profile?.name || user?.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  return (
    <div className="flex gap-4">
      <Card className="bg-white overflow-hidden w-full py-10">
        <CardContent className="flex px-8">
          <div className="flex w-full gap-10">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="size-32 md:size-56 rounded-xl">
                <AvatarImage src={profile?.picture || user?.image || ""} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <Badge className="bg-gold text-gold-foreground px-4 py-2 text-lg font-bold shadow-lg">
                +550
              </Badge>
            </div>
            <div className="flex flex-col items-center justify-center w-full min-w-full md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl text-foreground mb-2">
                    {profile?.name || user?.name || "Usuario"}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {profile?.position || "Sin cargo"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cargo</p>
                      <p className="text-sm">{profile?.position || "Sin cargo"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Área</p>
                      <p className="text-sm">{profile?.area || "Sin área"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Género
                      </p>
                      <p className="text-sm">{profile?.genderName || "Sin especificar"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Sede</p>
                      <p className="text-sm">{profile?.location || "Sin sede"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Correo electrónico
                      </p>
                      <p className="text-sm">{profile?.email || user?.email || "Sin correo"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Teléfono
                      </p>
                      <p className="text-sm">{profile?.phone || "Sin teléfono"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground md:col-span-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Celular
                      </p>
                      <p className="text-sm">{profile?.mobile || "Sin celular"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
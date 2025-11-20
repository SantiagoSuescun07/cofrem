"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBreadcrumb } from "./profile-breadcrumb";
import { useEffect, useState } from "react";

// Hook seguro para obtener el userId desde localStorage
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cofrem.user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserId(parsed?.uid || null);
        }
      } catch (error) {
        console.error("Error leyendo localStorage:", error);
      }
    }
  }, []);

  return userId;
}

export function ProfileHeader() {
  const userId = useUserId();

  if (!userId) {
    return (
      <div className="flex items-center justify-between">
        <ProfileBreadcrumb />
        <Button variant="outline" size="sm" disabled>
          <Edit className="h-4 w-4" />
          Editar perfil
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <ProfileBreadcrumb />
    </div>
  );
}

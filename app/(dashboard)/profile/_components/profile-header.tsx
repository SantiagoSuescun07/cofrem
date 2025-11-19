"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBreadcrumb } from "./profile-breadcrumb";
import { EditProfileDialog } from "./edit-profile-dialog";
import { useUserProfile } from "@/queries/profile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Hook seguro para obtener el userId desde localStorage
function useUserId() {
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
  const queryClient = useQueryClient()

  // Mientras NO exista userId → No renderizar nada rompible
  const { data: profile } = useUserProfile(userId!);

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

      <EditProfileDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
            Editar perfil
          </Button>
        }
        userId={userId}
        defaultValues={{
          gender: profile?.genderId || "",
          phone: profile?.phone || "",
          mobile: profile?.mobile || "",
          profileImageUrl: profile?.picture || "",
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["user-profile", userId],
            exact: false
          });
          toast.success("Datos actualizados.")
        }}
      />
    </div>
  );
}

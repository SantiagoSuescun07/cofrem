"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBreadcrumb } from "./profile-breadcrumb";
// import { EditProfileModal } from "./edit-profile-modal"

export function ProfileHeader() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = (data: any) => {
    console.log("Perfil actualizado:", data);
    // Aquí puedes agregar la lógica para guardar los datos
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <ProfileBreadcrumb />

        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Edit className="h-4 w-4" />
          Editar perfil
        </Button>
      </div>

      {/* <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSave={handleSaveProfile} /> */}
    </>
  );
}

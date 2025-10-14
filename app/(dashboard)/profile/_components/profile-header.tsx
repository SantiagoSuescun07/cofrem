"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBreadcrumb } from "./profile-breadcrumb";

export function ProfileHeader() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = (data: any) => {
    console.log("Perfil actualizado:", data);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <ProfileBreadcrumb />

        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent hover:bg-muted"
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

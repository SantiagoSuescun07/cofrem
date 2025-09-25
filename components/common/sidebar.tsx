"use client";

import React, { use } from "react";
import { X } from "lucide-react";
import * as Icons from "lucide-react";
import { UserProfile } from "@/components/common/user-profile";
import { User, SidebarItem, ModuleType } from "@/types";
import { SignOutButton } from "./sign-out-button";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  sidebarItems: SidebarItem[];
  activeModule: string;
  onModuleChange: (module: ModuleType) => void;
  onGoogleLogin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
  sidebarItems,
  activeModule,
  onModuleChange,
  onGoogleLogin,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleModuleClick = (id: ModuleType, route: string): void => {
    router.push(route);
    onModuleChange(id);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-[74.3px] px-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">COFREM</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Perfil del usuario */}
      <button onClick={() => router.push("/profile")} className="p-6 border-b border-gray-100 cursor-pointer hover:bg-muted w-full">
        <UserProfile />
      </button>

      {/* Navegación */}
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => {
          const IconComponent = Icons[
            item.icon as keyof typeof Icons
          ] as React.ComponentType<{
            size?: number;
            className?: string;
          }>;

          return (
            <button
              key={item.id}
              onClick={() => handleModuleClick(item.id as ModuleType, item.url)}
              className={`cursor-pointer w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                pathname === item.url || pathname.startsWith(item.url + "/")
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <IconComponent size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Google Integration */}
      <div className=" bottom-4 left-4 right-4 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              Google Workspace
            </span>
          </div>
          <button
            onClick={onGoogleLogin}
            className="w-full text-xs bg-white text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 border border-blue-200 transition-colors"
          >
            Configurar SSO
          </button>
        </div>
      </div>

      <div className="mt-2 px-4">
        <SignOutButton className="w-full bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-300/20 border border-red-200" />
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  notifications = 0,
  onSearch,
}) => {
  const pathname = usePathname();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleNotificationClick = (): void => {
    // Lógica para mostrar notificaciones
    console.log("Mostrar notificaciones");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar en COFREM..."
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/newsletters"
              className={cn(
                "text-sm text-gray-600 hover:text-primary transition-colors",
                pathname === "/newsletters" ||
                  pathname.startsWith("/newsletters" + "/")
                  ? "text-primary"
                  : ""
              )}
            >
              Boletín Interno
            </Link>
            <a
              href="/revista"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Revista Enlace
            </a>
          </nav>

          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 transition-colors"
            aria-label={`Notificaciones${
              notifications > 0 ? ` (${notifications})` : ""
            }`}
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

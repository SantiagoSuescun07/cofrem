"use client";
import React from "react";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { UserProfile } from "@/components/common/user-profile";
import { managementModules } from "@/constants/data";

interface ManagementSidebarProps {
  openCollapse: string | null;
  setOpenCollapse: (v: string | null) => void;
  activeCategory: string | null;
  setActiveCategory: (v: string) => void;
  router: any;
  onShowMainSidebar: () => void;
}

export const ManagementSidebar = ({
  openCollapse,
  setOpenCollapse,
  activeCategory,
  setActiveCategory,
  router,
  onShowMainSidebar,
}: ManagementSidebarProps) => {
  return (
    <aside className="hidden md:flex md:w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen z-10">
      {/* Logo */}
      <div className="flex items-center justify-between h-[74px] px-6 border-b border-gray-100">
        <Image
          src="/icons/logo_cofrem.svg"
          alt="Logo"
          width={100}
          height={30}
          className="h-[40px] w-auto"
        />
      </div>

      {/* Perfil */}
      <button
        onClick={() => router.push("/profile")}
        className="p-6 border-b border-gray-100 hover:bg-[#2deb7915] transition-colors"
      >
        <UserProfile />
      </button>

      {/* Módulos */}
      <nav className="flex-1 overflow-y-auto p-4">
        <button
          onClick={onShowMainSidebar}
          className="flex items-center gap-2 text-[#2f8cbd] font-medium mb-4 hover:text-[#11c99d]"
        >
          <Menu className="h-5 w-5" />
          <span>Menú Principal</span>
        </button>

        <div className="flex flex-col space-y-1">
          {managementModules.map((mod) => (
            <div key={mod.id} className="w-full">
              {/* Botón del módulo principal */}
              <button
                onClick={() =>
                  setOpenCollapse(openCollapse === mod.id ? null : mod.id)
                }
                className={`w-full flex justify-between items-center px-3 py-2.5 text-sm text-left rounded-md transition-colors ${
                  openCollapse === mod.id
                    ? "bg-[#e4fef1] text-[#11c99d]"
                    : "hover:bg-[#e4fef1] text-gray-700"
                }`}
              >
                <span>{mod.name}</span>
                {openCollapse === mod.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Subcategorías (solo visibles si el módulo está abierto) */}
              {openCollapse === mod.id && (
                <div className="w-full mt-1 space-y-1 pl-3 border-l border-gray-100">
                  {mod.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                        activeCategory === cat
                          ? "bg-[#e4fef1] text-[#11c99d]"
                          : "hover:bg-[#e4fef1] text-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { UserProfile } from "@/components/common/user-profile";
import { managementModules } from "@/constants/data";

interface ManagementSidebarMobileProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  openCollapse: string | null;
  setOpenCollapse: (v: string | null) => void;
  activeCategory: string | null;
  setActiveCategory: (v: string) => void;
  router: any;
  onShowMainSidebar: () => void;
}

export const ManagementSidebarMobile = ({
  open,
  setOpen,
  openCollapse,
  setOpenCollapse,
  activeCategory,
  setActiveCategory,
  router,
  onShowMainSidebar,
}: ManagementSidebarMobileProps) => {
  return (
    <div className="md:hidden border-b bg-white">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <Image
                src="/icons/logo_cofrem.svg"
                alt="Logo"
                width={100}
                height={30}
                className="h-[40px] w-auto"
              />
            </SheetTitle>
          </SheetHeader>

          <button
            onClick={() => router.push("/profile")}
            className="p-6 border-b border-gray-100 hover:bg-[#2deb7915] transition-colors"
          >
            <UserProfile />
          </button>

          <nav className="flex-1 overflow-y-auto p-4">
            <button
              onClick={() => {
                setOpen(false);
                onShowMainSidebar();
              }}
              className="flex items-center gap-2 text-[#2f8cbd] font-medium mb-4 hover:text-[#11c99d]"
            >
              <Menu className="h-5 w-5" />
              <span>Menú Principal</span>
            </button>

            <div className="flex flex-col space-y-1">
              {managementModules.map((mod) => (
                <div key={mod.id} className="w-full">
                  {/* Botón principal del módulo */}
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

                  {/* Subcategorías */}
                  {openCollapse === mod.id && (
                    <div className="w-full mt-1 space-y-1 pl-3 border-l border-gray-100">
                      {mod.categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setOpen(false); // cierra el sheet
                          }}
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

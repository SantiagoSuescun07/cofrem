"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/common/user-profile";
import Image from "next/image";

interface DirectorySidebarMobileProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  areas: any[];
  openCollapse: string | null;
  setOpenCollapse: (v: string | null) => void;
  router: any;
  onShowMainSidebar: () => void;
}

export const DirectorySidebarMobile = ({
  open,
  setOpen,
  areas,
  openCollapse,
  setOpenCollapse,
  router,
  onShowMainSidebar,
}: DirectorySidebarMobileProps) => {
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

            <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
              {areas.map((area) => (
                <div key={area.id} className="w-full">
                  <TabsTrigger
                    value={String(area.id)}
                    onClick={() =>
                      area.children.length > 0
                        ? setOpenCollapse(
                            openCollapse === String(area.id) ? null : String(area.id)
                          )
                        : null
                    }
                    className="w-full justify-between items-start px-3 py-2.5 text-sm text-left rounded-md flex whitespace-normal leading-tight transition-colors hover:bg-[#e4fef1] data-[state=active]:bg-[#e4fef1] data-[state=active]:text-[#11c99d]"
                  >
                    <span>{area.name}</span>
                    {area.children.length > 0 &&
                      (openCollapse === String(area.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 mt-1" />
                      ))}
                  </TabsTrigger>

                  {area.children.length > 0 && openCollapse === String(area.id) && (
                    <div className="w-full mt-1 space-y-1">
                      {area.children.map((child:any) => (
                        <TabsTrigger
                          key={child.id}
                          value={String(child.id)}
                          className="w-full justify-between items-start px-3 py-2.5 text-sm text-left rounded-md flex whitespace-normal leading-tight hover:bg-[#e4fef1] data-[state=active]:bg-[#e4fef1] data-[state=active]:text-[#11c99d]"
                        >
                          {child.name}
                        </TabsTrigger>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </TabsList>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

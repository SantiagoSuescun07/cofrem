"use client";
import React, { useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";
import { BreadcrumbHeader } from "@/components/directory/breadcrumb-header";
import { ManagementSidebar } from "@/components/management/management-sidebar";
import { ManagementSidebarMobile } from "@/components/management/ManagementSidebarMobile";
import { ManagementContent } from "@/components/management/ManagementTabsContent";
import { useDocuments } from "@/queries/management";

interface ManagementSystemLayoutProps {
  openCollapser: string | null;
  setOpenCollapser: (v: string | null) => void;
  activeCategory: string | null;
  setActiveCategory: (v: string) => void;
  showMainSheet: boolean;
  setShowMainSheet: (v: boolean) => void;
  showMainSidebar: boolean;
  setShowMainSidebar: (v: boolean) => void;
  notifications: number;
  router: any;
  currentUser: any;
  sidebarItems: any[];
  activeModule: string;
  setActiveModule: (v: string) => void;
}

export const ManagementSystemLayout = ({
  openCollapser,
  setOpenCollapser,
  activeCategory,
  setActiveCategory,
  showMainSheet,
  setShowMainSheet,
  showMainSidebar,
  setShowMainSidebar,
  notifications,
  router,
  currentUser,
  sidebarItems,
  activeModule,
  setActiveModule,
}: ManagementSystemLayoutProps) => {
  const { data: documents, isLoading } = useDocuments();

  // Auto-seleccionar el primer módulo cuando se carguen los documentos
  useEffect(() => {
    if (documents && documents.length > 0 && !openCollapser) {
      // Buscar el primer documento con módulo
      const firstDoc = documents.find((doc) => doc.field_modulo?.drupal_internal__tid);
      if (firstDoc?.field_modulo?.drupal_internal__tid) {
        setOpenCollapser(firstDoc.field_modulo.drupal_internal__tid.toString());
      }
    }
  }, [documents, openCollapser, setOpenCollapser]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
      <Tabs
        orientation="vertical"
        className="flex flex-1 flex-col md:flex-row w-full gap-0"
      >
        <ManagementSidebar
          openCollapse={openCollapser}
          setOpenCollapse={setOpenCollapser}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          router={router}
          onShowMainSidebar={() => setShowMainSidebar(true)}
          documents={documents}
          isLoading={isLoading}
        />

        <ManagementSidebarMobile
          open={showMainSheet}
          setOpen={setShowMainSheet}
          openCollapse={openCollapser}
          setOpenCollapse={setOpenCollapser}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          router={router}
          onShowMainSidebar={() => setShowMainSidebar(true)}
          documents={documents}
          isLoading={isLoading}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setShowMainSheet(true)}
            notifications={notifications}
          />
          <BreadcrumbHeader name="Gestion" />
          <div className="flex-1 overflow-y-auto p-8">
            <ManagementContent
              activeModule={openCollapser}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
        </main>
      </Tabs>

      {/* Sidebar principal modal */}
      {showMainSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <Sidebar
            isOpen
            onClose={() => setShowMainSidebar(false)}
            currentUser={currentUser}
            sidebarItems={sidebarItems}
            activeModule={activeModule ?? ""}
            onModuleChange={(id) => {
              setActiveModule(id);
              setShowMainSidebar(false);
              const item = sidebarItems.find((s: any) => s.id === id);
              if (item?.url) router.push(item.url);
            }}
          />
        </div>
      )}
    </div>
  );
};


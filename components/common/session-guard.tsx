"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function SessionGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Solo verificar si no estamos en una ruta de auth
    const isAuthRoute = pathname?.startsWith("/auth");
    
    // Evitar múltiples redirecciones
    if (hasRedirected.current) return;
    
    if (!isAuthRoute) {
      // Si no hay sesión (unauthenticated)
      if (status === "unauthenticated") {
        hasRedirected.current = true;
        const currentPath = pathname || "/";
        const callbackUrl = encodeURIComponent(currentPath);
        // Usar signOut para limpiar la sesión y redirigir
        signOut({ 
          callbackUrl: `/auth/login?callbackUrl=${callbackUrl}`,
          redirect: true 
        });
      } 
      // Si la sesión está autenticada pero no tiene usuario (sesión inválida)
      else if (status === "authenticated" && (!session || !session.user)) {
        hasRedirected.current = true;
        const currentPath = pathname || "/";
        const callbackUrl = encodeURIComponent(currentPath);
        // Usar signOut para limpiar la sesión y redirigir
        signOut({ 
          callbackUrl: `/auth/login?callbackUrl=${callbackUrl}`,
          redirect: true 
        });
      }
      // Si la sesión es null (retornada del callback)
      else if (status === "loading" && session === null) {
        // Esperar a que el status cambie
        return;
      }
    }
  }, [session, status, router, pathname]);

  return null;
}


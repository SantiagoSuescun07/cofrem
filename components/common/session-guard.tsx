"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SessionGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [errorCount, setErrorCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo verificar si no estamos en una ruta de auth
    const isAuthRoute = pathname?.startsWith("/auth");
    
    // Evitar múltiples redirecciones
    if (hasRedirected.current) return;
    
    // Limpiar timeout anterior si existe
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (!isAuthRoute) {
      // Si está cargando, esperar un poco antes de tomar acción
      if (status === "loading") {
        // Esperar hasta 3 segundos antes de considerar que hay un problema
        retryTimeoutRef.current = setTimeout(() => {
          // Si después de 3 segundos sigue cargando, podría ser un error de red
          // Pero no redirigir inmediatamente, solo incrementar contador
          if (errorCount < 3) {
            setErrorCount(prev => prev + 1);
          }
        }, 3000);
        return;
      }
      
      // Si no hay sesión (unauthenticated) - solo redirigir si no es un error temporal
      if (status === "unauthenticated") {
        // Si hay muchos errores seguidos, probablemente es un problema real
        if (errorCount >= 3) {
          hasRedirected.current = true;
          const currentPath = pathname || "/";
          const callbackUrl = encodeURIComponent(currentPath);
          signOut({ 
            callbackUrl: `/auth/login?callbackUrl=${callbackUrl}`,
            redirect: true 
          });
        } else {
          // Podría ser un error temporal de red, resetear contador después de un tiempo
          retryTimeoutRef.current = setTimeout(() => {
            setErrorCount(0);
          }, 5000);
        }
      } 
      // Si la sesión está autenticada pero no tiene usuario (sesión inválida)
      else if (status === "authenticated" && (!session || !session.user)) {
        hasRedirected.current = true;
        const currentPath = pathname || "/";
        const callbackUrl = encodeURIComponent(currentPath);
        signOut({ 
          callbackUrl: `/auth/login?callbackUrl=${callbackUrl}`,
          redirect: true 
        });
      }
      // Si la sesión es válida, resetear contador de errores
      else if (status === "authenticated" && session?.user) {
        setErrorCount(0);
      }
    }
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [session, status, router, pathname, errorCount]);

  return null;
}



"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInactivityDetector } from "@/hooks/use-inactivity-detector";

export function SessionGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [errorCount, setErrorCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authDataSavedRef = useRef(false);

  // Detectar inactividad del usuario
  useInactivityDetector({
    inactivityTimeout: 30 * 60 * 1000, // 30 minutos
    warningTimeout: 5 * 60 * 1000, // Advertir 5 minutos antes
    showWarning: true,
  });

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
          
          // Verificar si el cierre fue por inactividad
          const logoutReason = typeof window !== "undefined" 
            ? sessionStorage.getItem("cofrem.logout_reason")
            : null;
          
          const reasonParam = logoutReason === "inactivity" ? "&reason=inactivity" : "";
          
          // Limpiar el flag después de usarlo
          if (typeof window !== "undefined" && logoutReason) {
            sessionStorage.removeItem("cofrem.logout_reason");
          }
          
          signOut({ 
            callbackUrl: `/auth/login?callbackUrl=${callbackUrl}${reasonParam}`,
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
        
        // Verificar si el cierre fue por inactividad
        const logoutReason = typeof window !== "undefined" 
          ? sessionStorage.getItem("cofrem.logout_reason")
          : null;
        
        const reasonParam = logoutReason === "inactivity" ? "&reason=inactivity" : "";
        
        // Limpiar el flag después de usarlo
        if (typeof window !== "undefined" && logoutReason) {
          sessionStorage.removeItem("cofrem.logout_reason");
        }
        
        signOut({ 
          callbackUrl: `/auth/login?callbackUrl=${callbackUrl}${reasonParam}`,
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

  // useEffect separado para guardar authData en localStorage
  useEffect(() => {
    console.log("🔍 SessionGuard - useEffect ejecutado:", {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasDrupal: !!session?.drupal,
      hasAuthData: !!session?.drupal?.authData,
    });

    if (status === "authenticated" && session?.user && typeof window !== "undefined") {
      // Log completo de la sesión para debug
      console.log("📋 Sesión completa:", {
        user: session.user,
        drupal: session.drupal,
        drupalAuthData: session?.drupal?.authData,
      });

      // Verificar si hay authData en diferentes lugares
      const authData = session?.drupal?.authData;
      
      if (authData) {
        // Comparar si la data es diferente a la guardada para actualizarla
        const savedData = localStorage.getItem("drupalAuthData");
        const currentDataString = JSON.stringify(authData);
        const needsUpdate = savedData !== currentDataString;
        
        if (needsUpdate || !authDataSavedRef.current) {
          try {
            console.log("💾 Guardando authData en localStorage:", authData);
            localStorage.setItem("drupalAuthData", currentDataString);
            
            // También guardar el access_token directamente para facilitar el acceso
            if (authData.access_token) {
              localStorage.setItem("drupalAccessToken", authData.access_token);
              console.log("✅ Access token guardado:", authData.access_token.substring(0, 50) + "...");
            }
            
            authDataSavedRef.current = true;
            
            // Verificar que se guardó correctamente
            const saved = localStorage.getItem("drupalAuthData");
            const savedToken = localStorage.getItem("drupalAccessToken");
            console.log("✅ authData guardada correctamente en localStorage:", {
              key: "drupalAuthData",
              hasAccessToken: !!authData.access_token,
              hasUser: !!authData.user,
              hasRefreshToken: !!authData.refresh_token,
              saved: !!saved,
              savedLength: saved?.length,
              tokenSaved: !!savedToken,
              tokenPreview: savedToken?.substring(0, 50) + "...",
            });
            
            // Verificar acceso directo
            console.log("🔍 Verificación directa de localStorage:", {
              drupalAuthData: !!localStorage.getItem("drupalAuthData"),
              drupalAccessToken: !!localStorage.getItem("drupalAccessToken"),
            });
          } catch (error) {
            console.error("❌ Error al guardar authData en localStorage:", error);
          }
        } else {
          console.log("ℹ️ authData ya está actualizada en localStorage");
        }
      } else if (!authData) {
        console.log("⚠️ No hay authData en session.drupal.authData");
        console.log("📦 session.drupal completo:", session?.drupal);
        
        // Intentar obtener la data desde otros lugares si existe
        if (session?.drupal) {
          const drupalData = {
            accessToken: session.drupal.accessToken,
            refreshToken: session.drupal.refreshToken,
            user: session.drupal.user,
            expiresAt: session.drupal.expiresAt,
          };
          console.log("📦 Datos de Drupal disponibles (sin authData completa):", drupalData);
        }
      } else if (authDataSavedRef.current) {
        console.log("ℹ️ authData ya fue guardada previamente");
      }
    } else {
      // Resetear el flag cuando la sesión cambia
      if (authDataSavedRef.current) {
        authDataSavedRef.current = false;
        console.log("🔄 Flag de authData reseteado");
      }
    }
  }, [session, status]);

  return null;
}



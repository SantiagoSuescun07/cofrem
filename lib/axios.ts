import { ACCESS_TOKEN, REFRESH_TOKEN, apiBaseUrl } from "@/constants";
import axios from "axios";
import { toast } from "sonner";
import { getAccessToken, isExpired, clearToken } from "@/lib/token-manager";

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Variable para controlar el refresh token en curso
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);

      config.headers = config.headers ?? {};

      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 o 403 y aún no hemos intentado refrescar el token
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      // Verificar si ya estamos en proceso de logout para evitar bucles
      if (typeof window !== "undefined") {
        const isLoggingOut = sessionStorage.getItem("cofrem.logging_out");
        if (isLoggingOut === "true") {
          return Promise.reject(error);
        }
      }

      // Si ya hay un refresh en curso, agregar esta petición a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Obtener el refresh_token del localStorage
        const refreshToken = typeof window !== "undefined" 
          ? localStorage.getItem(REFRESH_TOKEN)
          : null;

        if (!refreshToken) {
          throw new Error("No hay refresh_token disponible");
        }

        // Llamar directamente al endpoint de Drupal para refrescar el token
        const refreshUrl = apiBaseUrl.endsWith('/') 
          ? `${apiBaseUrl}api/auth/refresh`
          : `${apiBaseUrl}/api/auth/refresh`;
        
        const refreshResponse = await axios.post(
          refreshUrl,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (refreshResponse.data?.access_token) {
          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token || refreshToken;
          const expiresIn = refreshResponse.data.expires_in || 3600;
          const expiresAt = Date.now() + expiresIn * 1000;

          // Actualizar los tokens en localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN, newAccessToken);
            localStorage.setItem(REFRESH_TOKEN, newRefreshToken);
            localStorage.setItem("cofrem.expires_at", String(expiresAt));
          }
          
          // Actualizar el header de autorización para la petición original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Procesar la cola de peticiones pendientes
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          // Reintentar la petición original
          return api(originalRequest);
        } else {
          throw new Error("No se recibió access_token en la respuesta");
        }
      } catch (refreshError: any) {
        // Si el refresh falla, limpiar el token y redirigir al login
        console.error("❌ Error al refrescar token:", refreshError);
        
        // Procesar la cola con el error
        processQueue(refreshError, null);
        isRefreshing = false;
        
        if (typeof window !== "undefined") {
          // Marcar que estamos en proceso de logout para evitar bucles
          sessionStorage.setItem("cofrem.logging_out", "true");
          
          // Limpiar todos los tokens
          clearToken();
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem("cofrem.user");
          
          // Limpiar todas las queries de React Query si está disponible
          try {
            // Intentar limpiar el cache de React Query
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent("cofrem:clear-queries"));
            }
          } catch (e) {
            console.warn("No se pudo limpiar queries de React Query:", e);
          }
          
          // Limpiar el flag después de un tiempo
          setTimeout(() => {
            sessionStorage.removeItem("cofrem.logging_out");
          }, 5000);
          
          // Solo redirigir si no estamos ya en la página de login
          if (!window.location.pathname.startsWith("/auth/login")) {
            // Verificar si el cierre fue por inactividad
            const logoutReason = sessionStorage.getItem("cofrem.logout_reason");
            
            if (logoutReason === "inactivity") {
              toast.error("Tu sesión se ha cerrado por inactividad. Por favor, inicia sesión nuevamente.");
            } else {
              toast.info("Tu sesión ha expirado. Inicia sesión nuevamente.");
            }
            
            // Guardar la URL actual para redirigir después del login
            const currentUrl = window.location.pathname + window.location.search;
            const callbackUrl = encodeURIComponent(currentUrl);
            const reasonParam = logoutReason === "inactivity" ? "&reason=inactivity" : "";
            
            // Limpiar el flag después de usarlo
            if (logoutReason) {
              sessionStorage.removeItem("cofrem.logout_reason");
            }
            
            window.location.href = `/auth/login?callbackUrl=${callbackUrl}${reasonParam}`;
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

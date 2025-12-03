import { ACCESS_TOKEN, REFRESH_TOKEN, apiBaseUrl } from "@/constants";
import axios from "axios";
import { toast } from "sonner";
import { getAccessToken, isExpired, clearToken } from "@/lib/token-manager";

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem(ACCESS_TOKEN); // o "access_token" directamente

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


// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = getAccessToken();
//       if (token && !isExpired()) {
//         config.headers = config.headers ?? {};
//         config.headers["Authorization"] = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 o 403 y aún no hemos intentado refrescar el token
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // Verificar si ya estamos en proceso de logout para evitar bucles
      if (typeof window !== "undefined") {
        const isLoggingOut = sessionStorage.getItem("cofrem.logging_out");
        if (isLoggingOut === "true") {
          return Promise.reject(error);
        }
      }

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
          
          // Reintentar la petición original
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        // Si el refresh falla, limpiar el token y redirigir al login
        console.error("❌ Error al refrescar token:", refreshError);
        
        if (typeof window !== "undefined") {
          // Marcar que estamos en proceso de logout para evitar bucles
          sessionStorage.setItem("cofrem.logging_out", "true");
          
          // Limpiar todos los tokens
          clearToken();
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem("cofrem.user");
          
          // Limpiar el flag después de un tiempo
          setTimeout(() => {
            sessionStorage.removeItem("cofrem.logging_out");
          }, 5000);
          
          // Solo redirigir si no estamos ya en la página de login
          if (!window.location.pathname.startsWith("/auth/login")) {
            toast.info("Tu sesión ha expirado. Inicia sesión nuevamente.");
            
            // Guardar la URL actual para redirigir después del login
            const currentUrl = window.location.pathname + window.location.search;
            const callbackUrl = encodeURIComponent(currentUrl);
            window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

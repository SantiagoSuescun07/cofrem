import { ACCESS_TOKEN, apiBaseUrl } from "@/constants";
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

// Función para limpiar todos los storages
const clearAllStorages = () => {
  try {
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error("Error al limpiar storages:", error);
  }
};

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    // Manejar errores 401 (No autorizado)
    if (status === 401) {
      try {
        clearToken();
        clearAllStorages();
        toast.info("Tu sesión ha expirado. Inicia sesión nuevamente.");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } catch {
        toast.error("Error al limpiar la sesión.");
      }
    }
    
    // Manejar errores 403 (Prohibido)
    if (status === 403) {
      try {
        clearToken();
        clearAllStorages();
        toast.error("No tienes permisos para acceder a este recurso. Serás redirigido al login.");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } catch {
        toast.error("Error al limpiar la sesión.");
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

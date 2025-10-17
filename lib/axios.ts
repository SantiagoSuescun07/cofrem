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
      const accessToken =
        getAccessToken() || localStorage.getItem(ACCESS_TOKEN);

      config.headers = config.headers ?? {};

      if (accessToken && !isExpired()) {
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
    if (error.response?.status === 401) {
      try {
        clearToken();
        toast.info("Tu sesión ha expirado. Inicia sesión nuevamente.");
        window.location.href = "/auth/login";
      } catch {
        toast.error("Error al limpiar la sesión.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

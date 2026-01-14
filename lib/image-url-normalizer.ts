/**
 * Normaliza URLs de imágenes para evitar problemas de doble encoding
 * y asegurar que las URLs estén correctamente formateadas para Next.js Image
 */
export function normalizeImageUrl(baseUrl: string, path: string): string {
  if (!path) return "";
  
  // Si la URL ya es absoluta, normalizarla y retornarla
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      return url.toString();
    } catch {
      return path;
    }
  }
  
  // Decodificar la URL si está codificada (maneja doble encoding)
  let decodedPath = path;
  try {
    // Intentar decodificar múltiples veces si es necesario (máximo 3 intentos)
    let previousPath = path;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      decodedPath = decodeURIComponent(previousPath);
      // Si no cambió o no hay más caracteres codificados, parar
      if (decodedPath === previousPath || !decodedPath.includes("%")) {
        break;
      }
      previousPath = decodedPath;
      attempts++;
    }
  } catch (e) {
    // Si falla la decodificación, usar la original
    decodedPath = path;
  }
  
  // Normalizar la URL base (remover barra final)
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  
  // Asegurar que el path empiece con / y eliminar barras duplicadas
  let normalizedPath = decodedPath;
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }
  // Eliminar barras duplicadas en el path
  normalizedPath = normalizedPath.replace(/\/+/g, "/");
  
  // Construir la URL final
  const finalUrl = `${normalizedBase}${normalizedPath}`;
  
  return finalUrl;
}

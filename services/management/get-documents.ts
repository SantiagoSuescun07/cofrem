import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { Document, DocumentFile } from "@/types/documents";

export const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const allDocuments: Document[] = [];
    const allIncluded = new Map<string, any>();
    let page = 0;
    const pageSize = 50; // Drupal JSON:API límite por defecto

    // Función auxiliar para hacer una petición
    const makeRequest = async (params: any) => {
      try {
        return await api.get("/jsonapi/node/documents", { params });
      } catch (error: any) {
        if (error.response?.status === 400) {
          // Si falla con include completo, intentar con include simplificado
          const simplifiedParams = { ...params };
          if (simplifiedParams.include) {
            simplifiedParams.include = "field_file,field_module_category,field_modulo";
          }
          return await api.get("/jsonapi/node/documents", { params: simplifiedParams });
        }
        throw error;
      }
    };

    // Primera petición
    let response = await makeRequest({
      include: "field_file,field_icon,field_module_category,field_modulo",
      "page[limit]": pageSize,
      "page[offset]": 0,
    });

    // Procesar primera página
    let data = response.data;
    allDocuments.push(...data.data || []);
    
    // Agregar included a nuestro mapa
    if (data.included && Array.isArray(data.included)) {
      data.included.forEach((included: any) => {
        if (included.id) {
          allIncluded.set(included.id, included);
        }
      });
    }

    // Obtener el total de documentos del meta count
    const totalCount = data.meta?.count || allDocuments.length;

    // Continuar obteniendo páginas mientras haya más datos
    while (allDocuments.length < totalCount) {
      page++;
      const offset = page * pageSize;

      // Si ya tenemos todos los documentos, salir
      if (allDocuments.length >= totalCount) {
        break;
      }

      try {
        response = await makeRequest({
          include: "field_file,field_icon,field_module_category,field_modulo",
          "page[limit]": pageSize,
          "page[offset]": offset,
        });

        data = response.data;
        
        if (data.data && data.data.length > 0) {
          allDocuments.push(...data.data);
          
          // Agregar nuevos included al mapa
          if (data.included && Array.isArray(data.included)) {
            data.included.forEach((included: any) => {
              if (included.id) {
                allIncluded.set(included.id, included);
              }
            });
          }

          // Actualizar el total count si está disponible
          const currentTotal = data.meta?.count || totalCount;
          if (currentTotal > totalCount) {
            // Si el total count cambió, actualizarlo
            // (esto no debería pasar, pero por si acaso)
          }

          // Si la respuesta trajo menos documentos que el pageSize, ya no hay más páginas
          if (data.data.length < pageSize) {
            break; // Ya obtuvimos todos los documentos disponibles
          }
        } else {
          break; // No hay más datos
        }
      } catch (pageError: any) {
        console.warn(`Error obteniendo página ${page}:`, pageError);
        break; // Detener si hay error en una página
      }
    }

    console.log(`Total documentos obtenidos: ${allDocuments.length}`);
    console.log(`Total included items: ${allIncluded.size}`);

    // Usar el mapa consolidado de included para procesar todos los documentos
    const includedById = allIncluded;

    // Validar que tenemos datos
    if (!allDocuments || allDocuments.length === 0) {
      console.warn("No hay datos en la respuesta de documentos");
      return [];
    }

  const documents: Document[] = allDocuments.map((item: any) => {
    // Resolver field_file (puede ser un array)
    const fileData = item.relationships.field_file?.data;
    const fieldFile: DocumentFile[] = [];
    
    if (Array.isArray(fileData) && fileData.length > 0) {
      fileData.forEach((fileRef: any) => {
        if (!fileRef?.id) return;
        
        const fileIncluded = includedById.get(fileRef.id);
        if (fileIncluded && fileIncluded.attributes) {
          const uri = fileIncluded.attributes.uri?.url;
          if (uri) {
            fieldFile.push({
              id: fileIncluded.id,
              filename: fileIncluded.attributes.filename || "",
              url: apiBaseUrl + uri,
              filemime: fileIncluded.attributes.filemime || "",
              filesize: fileIncluded.attributes.filesize || 0,
              description: fileRef.meta?.description || undefined,
            });
          } else {
            console.warn(`Archivo ${fileRef.id} no tiene URI válida:`, fileIncluded);
          }
        } else {
          console.warn(`Archivo ${fileRef.id} no encontrado en included para documento ${item.id}`);
        }
      });
    } else if (fileData && fileData.id) {
      const fileIncluded = includedById.get(fileData.id);
      if (fileIncluded && fileIncluded.attributes) {
        const uri = fileIncluded.attributes.uri?.url;
        if (uri) {
          fieldFile.push({
            id: fileIncluded.id,
            filename: fileIncluded.attributes.filename || "",
            url: apiBaseUrl + uri,
            filemime: fileIncluded.attributes.filemime || "",
            filesize: fileIncluded.attributes.filesize || 0,
            description: fileData.meta?.description || undefined,
          });
        } else {
          console.warn(`Archivo ${fileData.id} no tiene URI válida:`, fileIncluded);
        }
      } else {
        console.warn(`Archivo ${fileData.id} no encontrado en included para documento ${item.id}`);
      }
    }

    // Resolver field_icon
    const iconData = item.relationships.field_icon?.data;
    const iconIncluded = iconData ? includedById.get(iconData.id) : null;
    const fieldIcon = iconIncluded
      ? {
          id: iconIncluded.id,
          url: apiBaseUrl + iconIncluded.attributes.uri.url,
          alt: iconData.meta?.alt || "",
          title: iconData.meta?.title || "",
          width: iconData.meta?.width || 0,
          height: iconData.meta?.height || 0,
        }
      : null;

    // Resolver field_module_category
    const categoryData = item.relationships.field_module_category?.data;
    const categoryIncluded = categoryData
      ? includedById.get(categoryData.id)
      : null;
    const fieldModuleCategory = categoryIncluded
      ? {
          id: categoryIncluded.id,
          name: categoryIncluded.attributes.name || "",
          drupal_internal__tid:
            categoryIncluded.attributes.drupal_internal__tid || 0,
        }
      : null;

    // Resolver field_modulo
    const moduleData = item.relationships.field_modulo?.data;
    const moduleIncluded = moduleData
      ? includedById.get(moduleData.id)
      : null;
    const fieldModulo = moduleIncluded
      ? {
          id: moduleIncluded.id,
          name: moduleIncluded.attributes.name || undefined,
          drupal_internal__tid:
            moduleIncluded.attributes.drupal_internal__tid || 0,
        }
      : null;

    return {
      id: item.id,
      drupal_internal__nid: item.attributes.drupal_internal__nid || 0,
      title: item.attributes.title || "",
      created: item.attributes.created || "",
      changed: item.attributes.changed || "",
      field_file: fieldFile,
      field_icon: fieldIcon,
      field_module_category: fieldModuleCategory,
      field_modulo: fieldModulo,
    };
  });

  // Filtrar documentos que no tienen datos válidos
  const validDocuments = documents.filter((doc) => {
    return doc.id && doc.title;
  });

  return validDocuments;
  } catch (error: any) {
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const statusText = error.response.statusText;
      const errorData = error.response.data;
      
      console.error("Error fetching documents - Respuesta del servidor:", {
        status,
        statusText,
        url: error.config?.url,
        params: error.config?.params,
        errorData,
      });

      // Si es un error 400 (Bad Request) o 404 (Not Found), probablemente el endpoint no existe o los parámetros son inválidos
      if (status === 400 || status === 404) {
        console.warn("El endpoint de documentos no está disponible o los parámetros son inválidos. Retornando array vacío.");
        return [];
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error("Error fetching documents - No se recibió respuesta del servidor:", error.request);
    } else {
      // Algo más causó el error
      console.error("Error fetching documents - Error en la configuración:", error.message);
    }
    
    // En cualquier caso, retornar array vacío para no romper la UI
    return [];
  }
};


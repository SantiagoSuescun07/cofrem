import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { Document, DocumentFile } from "@/types/documents";

export const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get("/jsonapi/node/documents", {
      params: {
        include: "field_file,field_icon,field_module_category,field_modulo",
      },
    });

    console.log("Response completa:", response.data);

    const data = response.data;

    // Validar que tenemos datos
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("No hay datos en la respuesta de documentos");
      return [];
    }

    // Crear un mapa de recursos incluidos para acceso rápido
    const includedById = new Map<string, any>();
    if (data.included && Array.isArray(data.included)) {
      data.included.forEach((included: any) => {
        if (included.id) {
          includedById.set(included.id, included);
        }
      });
    }

  const documents: Document[] = data.data.map((item: any) => {
    // Resolver field_file (puede ser un array)
    const fileData = item.relationships.field_file?.data;
    const fieldFile: DocumentFile[] = [];
    
    if (Array.isArray(fileData)) {
      fileData.forEach((fileRef: any) => {
        const fileIncluded = includedById.get(fileRef.id);
        if (fileIncluded) {
          fieldFile.push({
            id: fileIncluded.id,
            filename: fileIncluded.attributes.filename || "",
            url: apiBaseUrl + fileIncluded.attributes.uri.url,
            filemime: fileIncluded.attributes.filemime || "",
            filesize: fileIncluded.attributes.filesize || 0,
            description: fileRef.meta?.description || undefined,
          });
        }
      });
    } else if (fileData) {
      const fileIncluded = includedById.get(fileData.id);
      if (fileIncluded) {
        fieldFile.push({
          id: fileIncluded.id,
          filename: fileIncluded.attributes.filename || "",
          url: apiBaseUrl + fileIncluded.attributes.uri.url,
          filemime: fileIncluded.attributes.filemime || "",
          filesize: fileIncluded.attributes.filesize || 0,
          description: fileData.meta?.description || undefined,
        });
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
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};


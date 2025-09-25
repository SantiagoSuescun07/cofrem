import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { Newsletter } from "@/types/newsletters";

export const fetchSingleNewsletter = async (id: string): Promise<Newsletter> => {
  const response = await api.get(`/jsonapi/node/report/${id}`, {
    params: {
      include:
        "field_attachments,field_category_report,field_main_image,field_report_pdf,field_type_report",
    },
  });

  const item = response.data.data;
  const includedById = new Map<string, any>();
  if (response.data.included) {
    response.data.included.forEach((inc: any) => includedById.set(inc.id, inc));
  }

  // Archivos adjuntos
  const attachmentsData = item.relationships.field_attachments?.data || [];
  const fieldAttachments = attachmentsData.map((att: any) => {
    const attIncluded = includedById.get(att.id);
    return {
      id: attIncluded.id,
      url: apiBaseUrl + attIncluded.attributes.uri.url,
    };
  });

  // Categoría
  const categoryData = item.relationships.field_category_report?.data;
  const categoryIncluded = categoryData ? includedById.get(categoryData.id) : null;
  const fieldCategoryReport = categoryIncluded
    ? {
        id: categoryIncluded.id,
        tid: categoryIncluded.attributes.drupal_internal__tid,
        name: categoryIncluded.attributes.name,
      }
    : null;

  // Imagen principal
  const mainImageData = item.relationships.field_main_image?.data;
  const mainImageIncluded = mainImageData ? includedById.get(mainImageData.id) : null;
  const fieldMainImage = mainImageIncluded
    ? {
        id: mainImageIncluded.id,
        url: apiBaseUrl + mainImageIncluded.attributes.uri.url,
        alt: mainImageData.meta.alt,
        title: mainImageData.meta.title,
        width: mainImageData.meta.width,
        height: mainImageData.meta.height,
      }
    : null;

  // PDF
  const pdfData = item.relationships.field_report_pdf?.data;
  const pdfIncluded = pdfData ? includedById.get(pdfData.id) : null;
  const fieldReportPdf = pdfIncluded
    ? {
        id: pdfIncluded.id,
        url: apiBaseUrl + pdfIncluded.attributes.uri.url,
      }
    : null;

  // Tipo
  const typeData = item.relationships.field_type_report?.data;
  const typeIncluded = typeData ? includedById.get(typeData.id) : null;
  const fieldTypeReport = typeIncluded
    ? {
        id: typeIncluded.id,
        tid: typeIncluded.attributes.drupal_internal__tid,
        name: typeIncluded.attributes.name,
      }
    : null;

  return {
    id: item.id,
    drupal_internal__nid: item.attributes.drupal_internal__nid,
    title: item.attributes.title,
    description: item.attributes.body?.processed ?? null,
    created: item.attributes.created,
    field_attachments: fieldAttachments,
    field_category_report: fieldCategoryReport,
    field_main_image: fieldMainImage,
    field_report_pdf: fieldReportPdf,
    field_type_report: fieldTypeReport,
  };
};
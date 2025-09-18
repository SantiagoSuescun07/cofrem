import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { News } from "@/types/news/news";

// export const fetchNews = async (
//   page: number = 1
// ): Promise<{ items: News[]; totalPages: number }> => {
//   const limit = 10; // Adjust as needed, e.g., 10 items per page

//   const response = await api.get("/jsonapi/node/news", {
//     params: {
//       "page[offset]": (page - 1) * limit,
//       "page[limit]": limit,
//       include:
//         "field_file_new,field_gallery,field_main_image,field_segmentation,field_publication_statuses",
//       // Optional: filter for published status if needed
//       // filter: { status: 1 },
//     },
//   });

//   const data = response.data;

//   // Create a map for included entities by their ID
//   const includedById = new Map<string, any>();
//   if (data.included) {
//     data.included.forEach((included: any) => {
//       includedById.set(included.id, included);
//     });
//   }

//   // Map the news items
//   const newsItems = data.data.map((item: any) => {
//     // Resolve field_file_new (single file)
//     const fileNewData = item.relationships.field_file_new?.data;
//     const fileNewIncluded = fileNewData
//       ? includedById.get(fileNewData.id)
//       : null;
//     const fieldFileNew = fileNewIncluded
//       ? {
//           id: fileNewIncluded.id,
//           url: apiBaseUrl + fileNewIncluded.attributes.uri.url,
//           display: item.relationships.field_file_new.data.meta.display,
//           description: item.relationships.field_file_new.data.meta.description,
//         }
//       : null;

//     // Resolve field_gallery (array of images/files)
//     const galleryData = item.relationships.field_gallery?.data || [];
//     const fieldGallery = galleryData.map((galItem: any) => {
//       const galIncluded = includedById.get(galItem.id);
//       return {
//         id: galIncluded.id,
//         url: apiBaseUrl + galIncluded.attributes.uri.url,
//         alt: galItem.meta.alt,
//         title: galItem.meta.title,
//         width: galItem.meta.width,
//         height: galItem.meta.height,
//       };
//     });

//     // Resolve field_main_image (single image/file)
//     const mainImageData = item.relationships.field_main_image?.data;
//     const mainImageIncluded = mainImageData
//       ? includedById.get(mainImageData.id)
//       : null;
//     const fieldMainImage = mainImageIncluded
//       ? {
//           id: mainImageIncluded.id,
//           url: apiBaseUrl + mainImageIncluded.attributes.uri.url,
//           alt: mainImageData.meta.alt,
//           title: mainImageData.meta.title,
//           width: mainImageData.meta.width,
//           height: mainImageData.meta.height,
//         }
//       : null;

//     // Resolve field_segmentation (array of taxonomy terms)
//     const segmentationData = item.relationships.field_segmentation?.data || [];
//     const fieldSegmentation = segmentationData.map((segItem: any) => {
//       const segIncluded = includedById.get(segItem.id);
//       return {
//         id: segIncluded.id,
//         name: segIncluded.attributes.name, // Assuming 'name' exists in taxonomy attributes
//         type: segIncluded.type,
//       };
//     });

//     // Resolve field_publication_statuses (single taxonomy term)
//     const pubStatusData = item.relationships.field_publication_statuses?.data;
//     const pubStatusIncluded = pubStatusData
//       ? includedById.get(pubStatusData.id)
//       : null;
//     const fieldPublicationStatuses = pubStatusIncluded
//       ? {
//           id: pubStatusIncluded.id,
//           name: pubStatusIncluded.attributes.name, // Assuming 'name' exists
//         }
//       : null;

//     return {
//       id: item.id,
//       nid: item.attribute.drupal_internal__nid,
//       title: item.attributes.title,
//       body: item.attributes.body.value, // Only the value
//       created: item.attributes.created,
//       comments: item.attributes.comment,
//       field_file_new: fieldFileNew,
//       field_gallery: fieldGallery,
//       field_main_image: fieldMainImage,
//       field_segmentation: fieldSegmentation,
//       field_publication_statuses: fieldPublicationStatuses,
//     };
//   });

//   // Calculate total pages from meta.count (if available)
//   const totalItems = data.meta?.count || 0;
//   const totalPages = Math.ceil(totalItems / limit);

//   return {
//     items: newsItems,
//     totalPages,
//   };
// };
// Fetch function for all news items (client-side pagination)
export const fetchNews = async (): Promise<{
  items: News[];
  totalPages: number;
}> => {
  const response = await api.get("/jsonapi/node/news", {
    params: {
      include:
        "field_file_new,field_gallery,field_main_image,field_segmentation,field_publication_statuses",
    },
  });

  console.log("API Response (all news):", response.data); // Debug log

  const data = response.data;

  const includedById = new Map<string, any>();
  if (data.included) {
    data.included.forEach((included: any) => {
      includedById.set(included.id, included);
    });
  }

  const newsItems = data.data.map((item: any) => {
    const fileNewData = item.relationships.field_file_new?.data;
    const fileNewIncluded = fileNewData
      ? includedById.get(fileNewData.id)
      : null;
    const fieldFileNew = fileNewIncluded
      ? {
          id: fileNewIncluded.id,
          url: apiBaseUrl + fileNewIncluded.attributes.uri.url,
          display: item.relationships.field_file_new.data.meta.display,
          description: item.relationships.field_file_new.data.meta.description,
        }
      : null;

    const galleryData = item.relationships.field_gallery?.data || [];
    const fieldGallery = galleryData.map((galItem: any) => {
      const galIncluded = includedById.get(galItem.id);
      return {
        id: galIncluded.id,
        url: apiBaseUrl + galIncluded.attributes.uri.url,
        alt: galItem.meta.alt,
        title: galItem.meta.title,
        width: galItem.meta.width,
        height: galItem.meta.height,
      };
    });

    const mainImageData = item.relationships.field_main_image?.data;
    const mainImageIncluded = mainImageData
      ? includedById.get(mainImageData.id)
      : null;
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

    const segmentationData = item.relationships.field_segmentation?.data || [];
    const fieldSegmentation = segmentationData.map((segItem: any) => {
      const segIncluded = includedById.get(segItem.id);
      return {
        id: segIncluded.id,
        name: segIncluded.attributes.name,
        type: segIncluded.type,
      };
    });

    const pubStatusData = item.relationships.field_publication_statuses?.data;
    const pubStatusIncluded = pubStatusData
      ? includedById.get(pubStatusData.id)
      : null;
    const fieldPublicationStatuses = pubStatusIncluded
      ? {
          id: pubStatusIncluded.id,
          name: pubStatusIncluded.attributes.name,
        }
      : null;

    return {
      id: item.id,
      drupal_internal__nid: item.attributes.drupal_internal__nid,
      title: item.attributes.title,
      body: item.attributes.body.value,
      created: item.attributes.created,
      comments: item.attributes.comment,
      field_file_new: fieldFileNew,
      field_gallery: fieldGallery,
      field_main_image: fieldMainImage,
      field_segmentation: fieldSegmentation,
      field_publication_statuses: fieldPublicationStatuses,
    };
  });

  const totalItems = newsItems.length; // Total items from the fetched data
  const limit = 10; // Client-side limit per page
  const totalPages = Math.ceil(totalItems / limit);

  console.log("Total Items:", totalItems, "Total Pages:", totalPages); // Debug log

  return {
    items: newsItems,
    totalPages,
  };
};

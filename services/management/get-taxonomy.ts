import api from "@/lib/axios";

export interface TaxonomyModule {
  id: number;
  name: string;
  uuid: string;
}

export interface TaxonomyCategory {
  id: number;
  name: string;
  uuid: string;
}

export const fetchModules = async (): Promise<TaxonomyModule[]> => {
  try {
    const { data } = await api.get("/jsonapi/taxonomy_term/modules_management_system");
    return data.data.map((item: any) => ({
      id: item.attributes.drupal_internal__tid,
      name: item.attributes.name,
      uuid: item.id,
    }));
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
};

export const fetchCategories = async (): Promise<TaxonomyCategory[]> => {
  try {
    const { data } = await api.get("/jsonapi/taxonomy_term/module_category");
    return data.data.map((item: any) => ({
      id: item.attributes.drupal_internal__tid,
      name: item.attributes.name,
      uuid: item.id,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};


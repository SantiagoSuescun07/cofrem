import api from "@/lib/axios";

export interface TaxonomyCategory {
  id: number;
  name: string;
  uuid: string;
  drupal_internal__tid: number;
  subareas?: TaxonomyCategory[];
  parentId?: number | null;
}

export interface TaxonomyModule {
  id: number;
  name: string;
  uuid: string;
  drupal_internal__tid: number;
  categories: TaxonomyCategory[];
}

export const fetchModules = async (): Promise<TaxonomyModule[]> => {
  try {
    const { data } = await api.get("/jsonapi/taxonomy_term/modules_management_system", {
      params: {
        include: "field_categories,field_categories.parent,parent",
      },
    });

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("No hay datos de módulos en la respuesta");
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

    // Obtener todas las categorías con su información de parent
    const allCategoriesMap = new Map<string, TaxonomyCategory>();
    
    if (data.included && Array.isArray(data.included)) {
      data.included.forEach((included: any) => {
        if (included.type === "taxonomy_term--module_category" && included.attributes) {
          const parentData = included.relationships?.parent?.data;
          const parentId = parentData?.[0]?.meta?.drupal_internal__target_id || null;
          
          allCategoriesMap.set(included.id, {
            id: included.attributes.drupal_internal__tid || 0,
            name: included.attributes.name || "",
            uuid: included.id,
            drupal_internal__tid: included.attributes.drupal_internal__tid || 0,
            parentId: parentId,
            subareas: [],
          });
        }
      });
    }

    // Filtrar solo módulos principales (con parent.id === "virtual")
    // Estos son los 9 módulos raíz de los que derivan las subcategorías
    const mainModules = data.data.filter((item: any) => {
      const parentData = item.relationships?.parent?.data;
      
      // Solo incluir módulos que tienen parent con id "virtual"
      if (!parentData || !Array.isArray(parentData) || parentData.length === 0) {
        return false;
      }
      
      const parentId = parentData[0]?.id;
      // Solo incluir si el parent es "virtual" (módulo raíz)
      return parentId === "virtual";
    });

    // Procesar cada módulo principal
    const processedModules = mainModules.map((item: any) => {
      // Obtener las categorías del módulo desde field_categories
      const categoriesData = item.relationships?.field_categories?.data || [];
      
      // Mapear las categorías principales (sin parent)
      const mainCategories: TaxonomyCategory[] = categoriesData
        .map((catRef: any) => {
          if (!catRef?.id) return null;
          const category = allCategoriesMap.get(catRef.id);
          if (!category) return null;
          
          // Solo incluir categorías principales (sin parent)
          if (category.parentId !== null && category.parentId !== undefined) {
            return null;
          }
          
          return category;
        })
        .filter((cat: any) => cat !== null) as TaxonomyCategory[];

      // Función recursiva para construir la jerarquía completa de categorías
      const buildCategoryHierarchy = (category: TaxonomyCategory): TaxonomyCategory => {
        // Buscar todas las categorías que tienen esta categoría como parent
        const childCategories = Array.from(allCategoriesMap.values())
          .filter((cat) => cat.parentId === category.drupal_internal__tid)
          .map((cat) => {
            // Recursivamente construir la jerarquía de cada hijo
            return buildCategoryHierarchy(cat);
          });

        // Ordenar subáreas por weight
        const sortedSubareas = childCategories.sort((a, b) => {
          const aIncluded = includedById.get(a.uuid);
          const bIncluded = includedById.get(b.uuid);
          const aWeight = aIncluded?.attributes?.weight ?? 999;
          const bWeight = bIncluded?.attributes?.weight ?? 999;
          if (aWeight !== bWeight) return aWeight - bWeight;
          return a.name.localeCompare(b.name);
        });

        return {
          ...category,
          subareas: sortedSubareas.length > 0 ? sortedSubareas : undefined,
        };
      };

      // Para cada categoría principal, construir su jerarquía completa
      mainCategories.forEach((mainCat, index) => {
        mainCategories[index] = buildCategoryHierarchy(mainCat);
      });

      // Ordenar categorías principales por weight
      mainCategories.sort((a, b) => {
        const aIncluded = includedById.get(a.uuid);
        const bIncluded = includedById.get(b.uuid);
        const aWeight = aIncluded?.attributes?.weight ?? 999;
        const bWeight = bIncluded?.attributes?.weight ?? 999;
        
        if (aWeight !== bWeight) {
          return aWeight - bWeight;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        id: item.attributes.drupal_internal__tid,
        name: item.attributes.name,
        uuid: item.id,
        categories: mainCategories,
        weight: item.attributes.weight ?? 999,
      };
    });

    // Ordenar módulos por weight, luego por nombre
    processedModules.sort((a: TaxonomyModule & { weight: number }, b: TaxonomyModule & { weight: number }) => {
      if (a.weight !== b.weight) {
        return a.weight - b.weight;
      }
      return a.name.localeCompare(b.name);
    });

    // Remover weight del resultado final
    return processedModules.map(({ weight, ...module }: TaxonomyModule & { weight: number }) => module);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
};



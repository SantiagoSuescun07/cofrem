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

// Interfaz para la respuesta del nuevo endpoint
interface AreaSubareaItem {
  id: number;
  status: boolean;
  name: string;
  description: string | null;
  weight: number;
  created: string | null;
  changed: string;
  children: AreaSubareaItem[];
}

// Función recursiva para transformar children a subareas
const transformChildrenToSubareas = (children: AreaSubareaItem[]): TaxonomyCategory[] => {
  return children.map((child) => ({
    id: child.id,
    name: child.name,
    uuid: `area-${child.id}`, // Generar un UUID único
    drupal_internal__tid: child.id, // Usar el ID como drupal_internal__tid
    parentId: null, // Se establecerá en el proceso
    subareas: child.children && child.children.length > 0 
      ? transformChildrenToSubareas(child.children) 
      : undefined,
  }));
};

export const fetchModules = async (): Promise<TaxonomyModule[]> => {
  try {
    // Llamar al nuevo endpoint con autenticación básica
    const { data } = await api.get("/factory-apis/taxonomy/area_subarea", {
      auth: {
        username: "admin",
        password: "admin",
      },
    });

    if (!data || !Array.isArray(data)) {
      console.warn("No hay datos en la respuesta del endpoint");
      return [];
    }

    // Filtrar solo items activos (status: true)
    const activeItems = data.filter((item: AreaSubareaItem) => item.status === true);

    // Transformar cada item de nivel superior en un módulo
    const modules: TaxonomyModule[] = activeItems.map((item: AreaSubareaItem) => {
      // Los children del item se convierten en categorías
      const categories: TaxonomyCategory[] = item.children && item.children.length > 0
        ? transformChildrenToSubareas(item.children)
        : [];

      return {
        id: item.id,
        name: item.name,
        uuid: `area-${item.id}`,
        drupal_internal__tid: item.id,
        categories: categories,
      };
    });

    // Ordenar módulos por weight, luego por nombre
    modules.sort((a, b) => {
      const aItem = activeItems.find((item: AreaSubareaItem) => item.id === a.id);
      const bItem = activeItems.find((item: AreaSubareaItem) => item.id === b.id);
      const aWeight = aItem?.weight ?? 999;
      const bWeight = bItem?.weight ?? 999;
      
      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }
      return a.name.localeCompare(b.name);
    });

    // Función recursiva para establecer parentId en las categorías
    const setParentIds = (categories: TaxonomyCategory[], parentId: number | null = null) => {
      categories.forEach((category) => {
        category.parentId = parentId;
        if (category.subareas && category.subareas.length > 0) {
          setParentIds(category.subareas, category.drupal_internal__tid);
        }
      });
    };

    // Establecer parentId en todas las categorías
    modules.forEach((module) => {
      setParentIds(module.categories);
    });

    // Ordenar categorías y subáreas por weight recursivamente
    const sortCategoriesByWeight = (categories: TaxonomyCategory[], items: AreaSubareaItem[]): TaxonomyCategory[] => {
      return categories
        .map((category) => {
          const item = items.find((i) => i.id === category.id);
          return {
            category,
            weight: item?.weight ?? 999,
          };
        })
        .sort((a, b) => {
          if (a.weight !== b.weight) {
            return a.weight - b.weight;
          }
          return a.category.name.localeCompare(b.category.name);
        })
        .map(({ category, weight }) => ({
          ...category,
          subareas: category.subareas 
            ? sortCategoriesByWeight(category.subareas, items)
            : undefined,
        }));
    };

    // Aplanar todos los items para buscar por ID
    const flattenItems = (items: AreaSubareaItem[]): AreaSubareaItem[] => {
      const result: AreaSubareaItem[] = [];
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          result.push(...flattenItems(item.children));
        }
      });
      return result;
    };

    const allItems = flattenItems(activeItems);

    // Ordenar categorías por weight
    modules.forEach((module) => {
      module.categories = sortCategoriesByWeight(module.categories, allItems);
    });

    return modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
};



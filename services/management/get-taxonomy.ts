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
    // Primero obtener todos los módulos con sus categorías
    const { data } = await api.get("/jsonapi/taxonomy_term/modules_management_system", {
      params: {
        include: "field_categories,field_categories.parent,parent",
      },
    });

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("No hay datos de módulos en la respuesta");
      return [];
    }

    // Hacer una petición adicional para obtener TODAS las categorías de module_category
    // Esto asegura que tenemos todas las subáreas, no solo las que están en included
    let allCategoriesResponse;
    try {
      allCategoriesResponse = await api.get("/jsonapi/taxonomy_term/module_category", {
        params: {
          include: "parent",
          "page[limit]": 1000, // Obtener todas las categorías
        },
      });
      console.log("Categorías adicionales obtenidas:", allCategoriesResponse.data?.data?.length || 0);
    } catch (error) {
      console.warn("No se pudieron obtener todas las categorías adicionales:", error);
      allCategoriesResponse = { data: { data: [], included: [] } };
    }

    // Combinar included de ambas respuestas
    const allIncluded = [
      ...(data.included || []),
      ...(allCategoriesResponse.data?.included || []),
      ...(allCategoriesResponse.data?.data || []), // Las categorías también pueden estar en data
    ];

    // Crear un mapa de recursos incluidos para acceso rápido
    const includedById = new Map<string, any>();
    allIncluded.forEach((included: any) => {
      if (included.id) {
        includedById.set(included.id, included);
      }
    });
    
    console.log("Total recursos en includedById:", includedById.size);

    // Obtener todas las categorías con su información de parent
    // Procesar tanto de data.included como de allCategoriesResponse
    const allCategoriesMap = new Map<string, TaxonomyCategory>();
    
    const processCategory = (included: any) => {
      if (included.type === "taxonomy_term--module_category" && included.attributes) {
        const parentData = included.relationships?.parent?.data;
        // El parent puede venir como array o como objeto único
        let parentId: number | null = null;
        
        if (Array.isArray(parentData) && parentData.length > 0) {
          parentId = parentData[0]?.meta?.drupal_internal__target_id || null;
        } else if (parentData && parentData.meta) {
          parentId = parentData.meta.drupal_internal__target_id || null;
        }
        
        const category = {
          id: included.attributes.drupal_internal__tid || 0,
          name: included.attributes.name || "",
          uuid: included.id,
          drupal_internal__tid: included.attributes.drupal_internal__tid || 0,
          parentId: parentId,
          subareas: [],
        };
        
        allCategoriesMap.set(included.id, category);
        return category;
      }
      return null;
    };
    
    // Procesar categorías de data.included
    if (data.included && Array.isArray(data.included)) {
      data.included.forEach((included: any) => {
        processCategory(included);
      });
    }
    
    // Procesar categorías de allCategoriesResponse (todas las categorías)
    if (allCategoriesResponse.data?.data && Array.isArray(allCategoriesResponse.data.data)) {
      allCategoriesResponse.data.data.forEach((included: any) => {
        const category = processCategory(included);
        if (category) {
          console.log(`Categoría adicional agregada: ${category.name} (TID: ${category.drupal_internal__tid}, parentId: ${category.parentId})`);
        }
      });
    }
    
    // También procesar included de allCategoriesResponse
    if (allCategoriesResponse.data?.included && Array.isArray(allCategoriesResponse.data.included)) {
      allCategoriesResponse.data.included.forEach((included: any) => {
        processCategory(included);
      });
    }
    
    console.log(`Total categorías en allCategoriesMap:`, allCategoriesMap.size);
    console.log(`Categorías con parent:`, Array.from(allCategoriesMap.values()).filter(c => c.parentId !== null).length);
    console.log(`Categorías sin parent:`, Array.from(allCategoriesMap.values()).filter(c => c.parentId === null).length);

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
      
      console.log(`Procesando módulo "${item.attributes.name}" (ID: ${item.attributes.drupal_internal__tid})`);
      console.log(`Categorías en field_categories:`, categoriesData.length);
      console.log(`Categorías data:`, categoriesData.map((c: any) => ({ id: c.id, target_id: c.meta?.drupal_internal__target_id })));
      
      // Mapear las categorías principales (sin parent)
      const mainCategories: TaxonomyCategory[] = categoriesData
        .map((catRef: any) => {
          if (!catRef?.id) {
            console.warn(`Categoría sin ID en módulo ${item.attributes.name}`);
            return null;
          }
          
          let category = allCategoriesMap.get(catRef.id);
          
          // Si no se encuentra en el mapa, intentar buscarla directamente en included
          if (!category) {
            console.warn(`Categoría ${catRef.id} no encontrada en allCategoriesMap, buscando en included...`);
            const includedCategory = includedById.get(catRef.id);
            if (includedCategory && includedCategory.type === "taxonomy_term--module_category") {
              const parentData = includedCategory.relationships?.parent?.data;
              let parentId: number | null = null;
              
              if (Array.isArray(parentData) && parentData.length > 0) {
                parentId = parentData[0]?.meta?.drupal_internal__target_id || null;
              } else if (parentData && parentData.meta) {
                parentId = parentData.meta.drupal_internal__target_id || null;
              }
              
              category = {
                id: includedCategory.attributes.drupal_internal__tid || 0,
                name: includedCategory.attributes.name || "",
                uuid: includedCategory.id,
                drupal_internal__tid: includedCategory.attributes.drupal_internal__tid || 0,
                parentId: parentId,
                subareas: [],
              };
              
              // Agregar al mapa para futuras referencias
              allCategoriesMap.set(catRef.id, category);
              console.log(`Categoría encontrada en included y agregada: ${category.name} (TID: ${category.drupal_internal__tid}, parentId: ${parentId})`);
            } else {
              console.error(`Categoría ${catRef.id} no encontrada ni en allCategoriesMap ni en included para módulo ${item.attributes.name}`);
              return null;
            }
          }
          
          if (!category) return null;
          
          console.log(`Categoría encontrada: ${category.name} (ID: ${category.drupal_internal__tid}, parentId: ${category.parentId})`);
          
          // Solo incluir categorías principales (sin parent)
          if (category.parentId !== null && category.parentId !== undefined) {
            console.log(`Categoría ${category.name} tiene parent, se excluye de categorías principales`);
            return null;
          }
          
          return category;
        })
        .filter((cat: any) => cat !== null) as TaxonomyCategory[];
      
      console.log(`Categorías principales para módulo "${item.attributes.name}":`, mainCategories.length, mainCategories.map(c => c.name));
      
      // Si no hay categorías principales (todas tienen parent), incluir todas las categorías del módulo
      // Esto puede pasar si todas las categorías son subáreas de otra categoría
      if (mainCategories.length === 0 && categoriesData.length > 0) {
        console.warn(`Módulo "${item.attributes.name}" no tiene categorías principales, incluyendo todas las categorías asociadas`);
        const allModuleCategories: TaxonomyCategory[] = categoriesData
          .map((catRef: any) => {
            if (!catRef?.id) return null;
            
            let category = allCategoriesMap.get(catRef.id);
            
            // Si no se encuentra, buscar en included
            if (!category) {
              const includedCategory = includedById.get(catRef.id);
              if (includedCategory && includedCategory.type === "taxonomy_term--module_category") {
                const parentData = includedCategory.relationships?.parent?.data;
                let parentId: number | null = null;
                
                if (Array.isArray(parentData) && parentData.length > 0) {
                  parentId = parentData[0]?.meta?.drupal_internal__target_id || null;
                } else if (parentData && parentData.meta) {
                  parentId = parentData.meta.drupal_internal__target_id || null;
                }
                
                category = {
                  id: includedCategory.attributes.drupal_internal__tid || 0,
                  name: includedCategory.attributes.name || "",
                  uuid: includedCategory.id,
                  drupal_internal__tid: includedCategory.attributes.drupal_internal__tid || 0,
                  parentId: parentId,
                  subareas: [],
                };
                
                allCategoriesMap.set(catRef.id, category);
              } else {
                return null;
              }
            }
            
            return category;
          })
          .filter((cat: any) => cat !== null) as TaxonomyCategory[];
        
        // Si encontramos categorías, usarlas como principales
        if (allModuleCategories.length > 0) {
          mainCategories.push(...allModuleCategories);
          console.log(`Categorías incluidas para módulo "${item.attributes.name}":`, mainCategories.length, mainCategories.map(c => c.name));
        }
      }
      
      // Función recursiva para construir la jerarquía completa de categorías
      const buildCategoryHierarchy = (category: TaxonomyCategory): TaxonomyCategory => {
        // Buscar todas las categorías que tienen esta categoría como parent
        // Buscar tanto en allCategoriesMap como en included para asegurar que encontramos todas
        const childCategories: TaxonomyCategory[] = [];
        
        // Buscar en allCategoriesMap
        Array.from(allCategoriesMap.values()).forEach((cat) => {
          if (cat.parentId === category.drupal_internal__tid) {
            childCategories.push(cat);
          }
        });
        
        // También buscar en included por si acaso hay categorías que no están en el mapa
        if (data.included && Array.isArray(data.included)) {
          data.included.forEach((included: any) => {
            if (included.type === "taxonomy_term--module_category" && included.attributes) {
              const parentData = included.relationships?.parent?.data;
              let parentId: number | null = null;
              
              if (Array.isArray(parentData) && parentData.length > 0) {
                parentId = parentData[0]?.meta?.drupal_internal__target_id || null;
              } else if (parentData && parentData.meta) {
                parentId = parentData.meta.drupal_internal__target_id || null;
              }
              
              // Si esta categoría tiene como parent la categoría actual y no está en childCategories
              if (parentId === category.drupal_internal__tid) {
                const existing = childCategories.find(c => c.drupal_internal__tid === included.attributes.drupal_internal__tid);
                if (!existing) {
                  const newCategory: TaxonomyCategory = {
                    id: included.attributes.drupal_internal__tid || 0,
                    name: included.attributes.name || "",
                    uuid: included.id,
                    drupal_internal__tid: included.attributes.drupal_internal__tid || 0,
                    parentId: parentId,
                    subareas: [],
                  };
                  childCategories.push(newCategory);
                  // Agregar al mapa para futuras referencias
                  allCategoriesMap.set(included.id, newCategory);
                }
              }
            }
          });
        }
        
        console.log(`Categoría "${category.name}" (TID: ${category.drupal_internal__tid}) tiene ${childCategories.length} subáreas:`, childCategories.map(c => c.name));

        // Construir recursivamente la jerarquía de cada hijo
        const childCategoriesWithHierarchy = childCategories.map((cat) => {
          return buildCategoryHierarchy(cat);
        });

        // Ordenar subáreas por weight
        const sortedSubareas = childCategoriesWithHierarchy.sort((a, b) => {
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



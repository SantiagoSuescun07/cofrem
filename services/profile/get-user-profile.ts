import api from "@/lib/axios";
import { apiBaseUrl } from "@/constants";
import { fetchTaxonomyTermById } from "@/services/taxonomies";

export interface UserProfileResponse {
  uid: { value: number }[];
  name: { value: string }[];
  mail: { value: string }[];
  field_full_name?: { value: string }[];
  field_charge?: { value: string }[];
  field_area_subarea?: { target_id: string }[];
  field_gender?: { target_id: string }[];
  field_headquarters?: { target_id: string }[];
  field_phone?: { value: string }[];
  field_cell_phone?: { value: string }[];
  user_picture?: { url: string }[];
  field_badges?: { target_uuid: string }[];
}

async function fetchBadgeById(badgeId: string) {
  const response = await api.get(
    `/jsonapi/taxonomy_term/badges/${badgeId}`,
    { params: { include: "field_image" } }
  );

  const item = response.data.data;
  const included = response.data.included;

  // Buscar la imagen
  let imageUrl = null;
  if (included?.length > 0) {
    const img = included.find((i: any) => i.type === "file--file");
    if (img) {
      imageUrl = apiBaseUrl + img.attributes.uri.url;
    }
  }

  return {
    id: item.id,
    tid: item.attributes.drupal_internal__tid,
    name: item.attributes.name,
    description: item.attributes.description?.value ?? null,
    image: imageUrl,
  };
}

export async function getUserProfile(userId: string) {
  const url = `/user/${userId}?_format=json`;
  const { data } = await api.get<UserProfileResponse>(url);

  const genderTargetId = data.field_gender?.[0]?.target_id;
  const areaTargetId = data.field_area_subarea?.[0]?.target_id;
  const headquartersTargetId = data.field_headquarters?.[0]?.target_id;

  const [gender, area, headquarters] = await Promise.all([
    genderTargetId
      ? fetchTaxonomyTermById("/jsonapi/taxonomy_term/gender", genderTargetId, "tid")
      : null,
    areaTargetId
      ? fetchTaxonomyTermById("/jsonapi/taxonomy_term/area_subarea", areaTargetId, "tid")
      : null,
    headquartersTargetId
      ? fetchTaxonomyTermById("/jsonapi/taxonomy_term/headquarters", headquartersTargetId, "tid")
      : null,
  ]);

  const badgeIds = data.field_badges?.map((b) => b.target_uuid) ?? [];

  const badges = await Promise.all(
    badgeIds.map(async (badgeId) => await fetchBadgeById(badgeId))
  );

  return {
    id: data.uid?.[0]?.value ?? null,
    name: data.field_full_name?.[0]?.value ?? data.name?.[0]?.value ?? "",
    email: data.mail?.[0]?.value ?? "",
    position: data.field_charge?.[0]?.value ?? "",
    area: area?.name ?? "",
    areaId: area?.id ?? null,
    location: headquarters?.name ?? "",
    locationId: headquarters?.id ?? null,
    phone: data.field_phone?.[0]?.value ?? "",
    mobile: data.field_cell_phone?.[0]?.value ?? "",
    picture: data.user_picture?.[0]?.url ?? "",
    genderId: String(gender?.tid) ?? null,
    genderName: gender?.name ?? "Sin especificar",
    badges: badges,
  };
}

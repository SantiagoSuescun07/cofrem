export interface Publication {
  id: string;
  drupal_internal__nid: number;
  title: string;
  description: string;
  created: string;
  field_any_link: string | null;
  field_video_link: string | null;
  field_gallery: {
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  }[];
  field_image: {
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  } | null;
}
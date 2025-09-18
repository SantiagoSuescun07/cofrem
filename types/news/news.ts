// Define the interface for the News item based on required fields
export interface News {
  id: string;
  drupal_internal__nid: number;
  title: string;
  body: string; // Only the value (HTML content)
  created: string; // Keep as string or convert to Date if needed
  comments: {
    status: number;
    cid: number;
    last_comment_timestamp: number;
    last_comment_name: string;
    last_comment_uid: number;
    comment_count: number;
  };
  field_file_new: {
    id: string;
    url: string;
    display: boolean;
    description: string;
  } | null;
  field_gallery: Array<{
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  }>;
  field_main_image: {
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  } | null;
  field_segmentation: Array<{
    id: string;
    name: string; // Assuming taxonomy terms have a 'name' attribute
    type: string; // e.g., 'taxonomy_term--roles_segmentation' or 'taxonomy_term--headquarters'
  }>;
  field_publication_statuses: {
    id: string;
    name: string; // Assuming taxonomy terms have a 'name' attribute
  } | null;
}

// Define the interface for a User
interface User {
  id: string;
  name: string;
}

// Define the interface for a Comment (updated to include user)
export interface Comment {
  id: string;
  body: string; // field_body_default
  created: string;
  user: User | null; // Added user field
}

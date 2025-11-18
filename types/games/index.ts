export interface EntertainmentCampaign {
  id: string;
  drupal_internal__nid: number;
  title: string;
  body: string;
  created: string;
  changed: string;
  field_date_range: {
    value: string;
    end_value: string;
  };
  field_main_image: {
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  } | null;
  field_game_type: {
    type: string;
    id: string;
    href: string;
  } | null;
  field_badges: {
    id: string;
    name: string;
  } | null;
}

export interface GameDetails {
  id: string;
  type: string;
  field_title: string;
  field_description: string;
  field_grid_size: string;
  field_points_per_word: number;
  field_time_limit: number;
  field_word_directions: string[];
  field_words_to_find: string;
  field_icon: {
    id: string;
    url: string;
    alt: string;
    title: string;
    width: number;
    height: number;
  } | null;
}

export type GameType = "wordsearch_game" | "puzzle_game" | "trivia_game";

export interface GameConfig {
  title: string;
  description: string;
  words: string[];
  pointsPerWord: number;
  gridSize: 10 | 15 | 20;
  directions: {
    horizontal: boolean;
    vertical: boolean;
    diagonal: boolean;
    reverse: boolean;
  };
  timeLimit: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface RankingEntry {
  position: number;
  user: string;
  area: string | null;
  points: string;
  games_completed: string;
  is_current_user: boolean;
}

export interface RankingResponse {
  campaign: string;
  period: string;
  visibility: string;
  tiebreaker: string;
  ranking: RankingEntry[];
}


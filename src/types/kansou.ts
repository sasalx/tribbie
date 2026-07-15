import type { Genre, MediaType } from './anilist'

export interface Dimension {
  key: string
  label: string
  description: string
  weight: number
}

export interface DimensionsResponse {
  config_hash: string
  dimensions: Dimension[]
}

export interface GenerateScoreBody {
  media_id: number
  primary_genre: string
  scores: Record<string, number>
  selected_genres: string[]
}

export interface ResultDimension {
  key: string
  label: string
  score: number
  base_weight: number
  applied_multiplier: number
  final_weight: number
  contribution: number
  bias_resistant: boolean
  weight_override: boolean
  skipped: boolean
  primary_genre_multiplier?: number
  secondary_genres_multiplier?: number
}

export interface ScoreResultMeta {
  media_id: number
  title_romaji: string
  title_english: string
  media_type: MediaType
  anilist_url: string
  all_genres: Genre[]
  matched_genres: Genre[]
  genres_active: Genre[]
  config_hash: string
  primary_genre: string
  primary_genre_weight: number
  effective_weight_sum: number
}

export interface ScoreResultResponse {
  final_score: number
  breakdown: ResultDimension[]
  meta: ScoreResultMeta
}

export interface PublishScoreBody {
  media_id: number
  notes: string
  score: number
}

export interface WeightsRequestBody {
  media_id: number
  primary_genre: string
  selected_genres: string[]
  skipped_dimensions?: Record<string, boolean>
  weight_overrides?: Record<string, number>
}

export interface WeightsResponseDimension {
  key: string
  label: string
  base_weight: number
  multiplier: number
  effective_weight: number
  final_weight: number
  primary_genre_multiplier?: number
  secondary_genres_multiplier?: number
  bias_resistant: boolean
  weight_override: boolean
  skipped: boolean
}

export interface WeightsResponse {
  dimensions: WeightsResponseDimension[]
  effective_weight_sum: number
  primary_genre_weight: number
}

export interface ConfigDimension {
  bias_resistant: boolean
  description: string
  label: string
  weight: number
}

export interface ConfigResponse {
  config_hash: string
  dimensions: Record<string, ConfigDimension>
  genres: Record<string, Record<string, number>>
  max_history: number
  max_multiplier: number
  primary_genre_weight: number
}

export interface HistoryItem {
  anilist_id: number
  cover_image: string
  entry_count: number
  final_score: number
  format: string
  media_type: string
  score_id: number
  scored_at: string
  title_romaji: string
}

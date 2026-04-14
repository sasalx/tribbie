import type { MediaType } from './anilist'

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
}

export interface ScoreResultMeta {
  media_id: number
  title_romaji: string
  title_english: string
  media_type: MediaType
  anilist_url: string
  all_genres: string[]
  matched_genres: string[]
  genres_active: string[]
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

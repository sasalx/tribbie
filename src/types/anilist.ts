export type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC' | 'MANGA' | 'NOVEL' | 'ONE_SHOT'
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS'
export type MediaType = 'ANIME' | 'MANGA'

export interface MediaResponse {
  id: number
  title_romaji: string
  title_english: string
  title_native: string
  format: MediaFormat
  status: MediaStatus
  episodes: number
  genres: string[]
  cover_image: string
  banner_image: string
  average_score: number
  mean_score: number
  media_type: MediaType
  anilist_url: string
}

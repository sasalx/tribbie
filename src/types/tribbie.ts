import type { MediaType } from './anilist'

export interface MediaHeroSectionType {
  cover_image: string
  media_type: MediaType
  title_romaji: string
  title_english: string
  title_native: string
  anilist_url: string
}

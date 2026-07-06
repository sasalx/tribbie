import type { ScoreResultResponse } from '~/types/kansou'

const STORAGE_KEY = 'tribbie-history'

export interface HistoryEntry {
  result: ScoreResultResponse
  coverImage?: string
  bannerImage?: string
  savedAt: number
}

function load(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  }
  catch {
    return []
  }
}

export function useHistory() {
  const entries = ref<HistoryEntry[]>(load())

  return { entries }
}

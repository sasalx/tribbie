import type { ScoreResultResponse } from '~/types/kansou'

const STORAGE_KEY = 'tribbie-history'
const MAX_ENTRIES = 3

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

function save(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useHistory() {
  const entries = ref<HistoryEntry[]>(load())

  function addEntry(entry: Omit<HistoryEntry, 'savedAt'>) {
    const existing = entries.value.filter(e => e.result.meta.media_id !== entry.result.meta.media_id)
    entries.value = [{ ...entry, savedAt: Date.now() }, ...existing].slice(0, MAX_ENTRIES)
    save(entries.value)
  }

  return { entries, addEntry }
}

<script setup lang="ts">
import type { HistoryItem } from '~/types/kansou'
import { EyeOffOutline, TrashOutline } from '@vicons/ionicons5'
import { api } from '~/api/client'
import { beautifyNumber, scoreTier } from '~/utils/stringUtils'

const { t } = useI18n()

const historyEntries = ref<HistoryItem[]>([])
const isLoading = ref(true)
const shufflingId = ref<number | null>(null)
const detailState = reactive<Record<number, { entries: HistoryItem[], index: number }>>({})

async function fetchHistory() {
  isLoading.value = true
  historyEntries.value = await api.get<HistoryItem[]>('/v1/history')
  isLoading.value = false
}

onMounted(fetchHistory)

function formatTime(scoredAt: string) {
  return new Date(scoredAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function currentScore(entry: HistoryItem): number {
  const state = detailState[entry.anilist_id]
  return state ? state.entries[state.index].final_score : entry.final_score
}

function currentDate(entry: HistoryItem): string {
  const state = detailState[entry.anilist_id]
  return state ? state.entries[state.index].scored_at : entry.scored_at
}

async function handleCardShuffle(entry: HistoryItem) {
  if (entry.entry_count <= 1 || shufflingId.value !== null) {
    return
  }

  if (!detailState[entry.anilist_id]) {
    const entries = await api.get<HistoryItem[]>(`/v1/history/${entry.anilist_id}`)
    detailState[entry.anilist_id] = { entries, index: 0 }
  }

  shufflingId.value = entry.score_id

  // Swap content while card is invisible (40% into 500ms ≈ 220ms)
  setTimeout(() => {
    const state = detailState[entry.anilist_id]
    state.index = (state.index + 1) % state.entries.length
  }, 220)

  setTimeout(() => {
    shufflingId.value = null
  }, 500)
}

async function handleHide(scoreId: number) {
  await api.delete(`/v1/history/${scoreId}`)
  await fetchHistory()
}

async function handleDelete(scoreId: number) {
  // await api.delete(`/v1/history/${scoreId}`)
  historyEntries.value = historyEntries.value.filter(entry => entry.score_id !== scoreId)
}
</script>

<template>
  <div class="history">
    <h1 class="history__title">
      {{ t('history.title') }}
    </h1>

    <NSpin v-if="isLoading" />

    <div v-else-if="historyEntries.length === 0" class="history__empty">
      {{ t('history.empty') }}
    </div>

    <NTimeline v-else>
      <NTimelineItem
        v-for="entry in historyEntries"
        :key="entry.score_id"
      >
        <div class="history__item">
          <div
            class="history__card-stack"
            :class="{ 'history__card-stack--stacked': entry.entry_count > 1 }"
            @click="handleCardShuffle(entry)"
          >
            <NCard
              class="history__card"
              :class="{ 'history__card--shuffling': shufflingId === entry.score_id }"
            >
              <div class="history__card-content">
                <NImage
                  :src="entry.cover_image"
                  :alt="entry.title_romaji"
                  width="48"
                  height="72"
                  object-fit="cover"
                  class="history__card-cover"
                  preview-disabled
                />
                <div class="history__card-info">
                  <span class="history__card-title">{{ entry.title_romaji }}</span>
                  <span class="history__card-subtitle">{{ entry.format }}</span>
                  <span class="history__card-date">{{ formatTime(currentDate(entry)) }}</span>
                </div>
                <span class="history__card-score" :style="{ color: `var(--color-score-${scoreTier(currentScore(entry))})` }">
                  {{ beautifyNumber(currentScore(entry), 2) }}
                </span>
              </div>
            </NCard>
          </div>
          <NButton text @click.stop="handleHide(entry.score_id)">
            <NIcon size="22" class="history__hide-icon">
              <EyeOffOutline />
            </NIcon>
          </NButton>
          <NButton text disabled @click.stop="handleDelete(entry.score_id)">
            <NIcon size="22" class="history__delete-icon">
              <TrashOutline />
            </NIcon>
          </NButton>
        </div>
      </NTimelineItem>
    </NTimeline>
  </div>
</template>

<style lang="scss" scoped>
@keyframes card-shuffle {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  40% {
    transform: translate(10px, 10px);
    opacity: 0.2;
  }
  41% {
    transform: translate(-6px, -6px);
    opacity: 0;
  }
  65% {
    transform: translate(-6px, -6px);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}

.history {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  &__empty {
    font-size: var(--font-size-sm);
    color: var(--color-text-subtle);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__card-stack {
    flex: 1;
    position: relative;

    &--stacked {
      cursor: pointer;

      &::before,
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-sm);
        background: var(--n-color, rgba(255, 255, 255, 0.06));
        border: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.1));
        z-index: -1;
      }

      &::before {
        transform: translate(10px, 10px);
      }

      &::after {
        transform: translate(5px, 5px);
      }
    }
  }

  &__card {
    position: relative;
    z-index: 0;

    &--shuffling {
      animation: card-shuffle 0.5s ease-in-out forwards;
    }
  }

  &__card-cover {
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  &__hide-icon {
    color: var(--color-score-ok);
  }

  &__delete-icon {
    color: var(--color-danger);
  }

  &__card-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__card-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 0;
  }

  &__card-title {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__card-subtitle {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }

  &__card-date {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }

  &__card-score {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    flex-shrink: 0;
  }
}
</style>

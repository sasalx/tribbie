<script setup lang="ts">
import { useHistory } from '~/composables/useHistory'
import { beautifyNumber } from '~/utils/stringUtils'

const { t } = useI18n()
const router = useRouter()
const { entries } = useHistory()

function handleClick(index: number) {
  const entry = entries.value[index]
  router.push({
    path: '/result',
    state: {
      result: JSON.stringify(entry.result),
      coverImage: entry.coverImage,
      bannerImage: entry.bannerImage,
    },
  })
}

function formatTime(time: number) {
  return new Date(time).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <div class="history">
    <h1 class="history__title">
      {{ t('history.title') }}
    </h1>

    <div v-if="entries.length === 0" class="history__empty">
      {{ t('history.empty') }}
    </div>

    <NTimeline v-else>
      <NTimelineItem
        v-for="(entry, i) in entries"
        :key="entry.result.meta.media_id"
        :time="formatTime(entry.savedAt)"
      >
        <NCard hoverable class="history__card" @click="handleClick(i)">
          <div class="history__card-content">
            <NImage
              :src="entry.coverImage"
              :alt="entry.result.meta.title_romaji"
              width="60"
              height="90"
              object-fit="cover"
              class="history__card-cover"
              preview-disabled
            />
            <div class="history__card-info">
              <span class="history__card-title">{{ entry.result.meta.title_romaji }}</span>
              <span class="history__card-subtitle">{{ entry.result.meta.title_english }}</span>
            </div>
            <span class="history__card-score">
              {{ beautifyNumber(entry.result.final_score, 1) }}
            </span>
          </div>
        </NCard>
      </NTimelineItem>
    </NTimeline>
  </div>
</template>

<style lang="scss" scoped>
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

  &__card {
    cursor: pointer;
  }

  &__card-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__card-cover {
    border-radius: var(--radius-sm);
    flex-shrink: 0;
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

  &__card-score {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    flex-shrink: 0;
  }
}
</style>

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
  <div class="max-w-3xl mx-auto flex flex-col gap-4">
    <h1 class="text-2xl font-semibold">
      {{ t('history.title') }}
    </h1>

    <div v-if="entries.length === 0" class="opacity-50 text-sm">
      {{ t('history.empty') }}
    </div>

    <NTimeline v-else>
      <NTimelineItem
        v-for="(entry, i) in entries"
        :key="entry.result.meta.media_id"
        :time="formatTime(entry.savedAt)"
      >
        <NCard hoverable class="cursor-pointer" @click="handleClick(i)">
          <div class="flex gap-4 items-center">
            <NImage
              :src="entry.coverImage"
              :alt="entry.result.meta.title_romaji"
              width="60"
              height="90"
              object-fit="cover"
              class="rounded shrink-0"
              preview-disabled
            />
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <span class="font-semibold truncate">{{ entry.result.meta.title_romaji }}</span>
              <span class="text-xs opacity-50">{{ entry.result.meta.title_english }}</span>
            </div>
            <span class="text-2xl font-bold shrink-0">
              {{ beautifyNumber(entry.result.final_score, 1) }}
            </span>
          </div>
        </NCard>
      </NTimelineItem>
    </NTimeline>
  </div>
</template>

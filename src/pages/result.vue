<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { PublishScoreBody, ResultDimension, ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'
import { useNotification } from 'naive-ui'
import { api } from '~/api/client'
import WeightDetail from '~/components/WeightDetail.vue'
import { beautifyNumber, decimalToPercentage } from '~/utils/stringUtils'

const state = window.history.state as {
  result: string
  coverImage?: string
  bannerImage?: string
}
const result = JSON.parse(state.result) as ScoreResultResponse
const bannerImage = state.bannerImage
const heroData: MediaHeroSectionType = {
  cover_image: state.coverImage ?? '',
  media_type: result.meta.media_type,
  title_romaji: result.meta.title_romaji,
  title_english: result.meta.title_english,
  title_native: '',
  anilist_url: result.meta.anilist_url,
}
const primaryGenreWeight = result.meta.primary_genre_weight

const notification = useNotification()
const { addEntry } = useHistory()
const isPublishLoading = ref(false)
const addNotes = ref(false)

addEntry({ result, coverImage: state.coverImage, bannerImage: state.bannerImage })

const scoreTexts: Record<number, string> = {
  1: 'Bad day for having eyes and ears eh?',
  2: 'One might wonder what made you to continue to watch the show.',
  3: 'There was a spark but you swiped left.',
  4: 'Was it missing the lamb sauce?',
  5: 'Have you ever wondered what people actually mean when they say something is aggressively mid?',
  6: 'This is fine.',
  7: 'Time to discuss what this show could have been in forums.',
  8: 'Two years later you will look at your list and say "Oh yeah this one was pretty good".',
  9: 'Has your journey been good? Has it been worthwile?',
  10: 'Absolute cinema!',
}

const scoreText = computed(() => {
  if (beautifyNumber(result.final_score, 1) === '3.6') {
    return 'Not great, not terrible.'
  }
  return scoreTexts[Math.round(result.final_score)] ?? ''
})
const scoreColor = computed(() => {
  const score = result.final_score

  if (score === 10) {
    return '#63e2b7' // green
  }
  else if (score >= 8) {
    return '#a855f7' // purple
  }
  else if (score >= 6) {
    return '#3b82f6' // blue
  }
  else if (score >= 4) {
    return '#eab308' // yellow
  }
  else {
    return '#ef4444' // red
  }
})

const columns: DataTableColumns<ResultDimension> = [
  { title: 'Dimension', key: 'label' },
  { title: 'Score', key: 'score', align: 'center', titleAlign: 'center', render: row => row.skipped ? h('span', { class: 'text-red-500' }, 'Skipped') : String(row.score) },
  {
    title: 'Weight',
    key: 'final_weight',
    align: 'center',
    titleAlign: 'center',
    render: row => row.skipped
      ? '—'
      : h(WeightDetail, {
          label: row.label,
          baseWeight: row.base_weight,
          appliedMultiplier: row.applied_multiplier,
          finalWeight: row.final_weight,
          effectiveWeightSum: result.meta.effective_weight_sum,
          primaryGenreWeight,
          primaryGenreMultiplier: row.primary_genre_multiplier ?? 0,
          secondaryGenresMultiplier: row.secondary_genres_multiplier ?? 0,
        }),
  },
  { title: 'Contribution to Final Score', key: 'contribution', align: 'center', titleAlign: 'center', render: row => row.skipped ? '—' : beautifyNumber(row.contribution, 2) },
]
const scoreTableAsNotes = ref((() => {
  const lines: string[] = [
    `Final Score: ${beautifyNumber(result.final_score, 1)}/10`,
    `Effective Weight Sum: ${beautifyNumber(result.meta.effective_weight_sum)}`,
    '',
  ]

  result.breakdown.forEach((dim) => {
    const child = ' '

    if (dim.skipped) {
      lines.push(`${dim.label}: Skipped`)
    }
    else {
      lines.push(`${dim.label}: ${dim.score}/10`)
      lines.push(`${child} ├─ Base Weight: ${decimalToPercentage(dim.base_weight)}`)
      lines.push(`${child} ├─ Genre Multiplier: × ${beautifyNumber(dim.applied_multiplier)}`)
      lines.push(`${child} ├─ Effective Weight: ${beautifyNumber(dim.base_weight * dim.applied_multiplier)}`)
      lines.push(`${child} ├─ Final Weight: ${decimalToPercentage(dim.final_weight)}`)
      lines.push(`${child} └─ Contribution: ${beautifyNumber(dim.contribution, 2)}`)
    }
  })

  return lines.join('\n')
})())

async function handlePublish() {
  isPublishLoading.value = true

  await api.post('/score/publish', {
    media_id: result.meta.media_id,
    score: Number(beautifyNumber(result.final_score, 1)),
    notes: addNotes.value ? scoreTableAsNotes.value : '',
  } satisfies PublishScoreBody)

  isPublishLoading.value = false
  notification.success({ title: 'Success', description: 'Your score has been sent to AniList.', duration: 5000 })
}
</script>

<template>
  <div class="min-h-full">
    <BannerImage :src="bannerImage" />

    <div class="max-w-3xl mx-auto px-4 -mt-8 pb-12 relative z-10">
      <NCard bordered>
        <div class="flex flex-col gap-4">
          <MediaHeroSection :data="heroData" />
          <NDivider />
          <div class="flex flex-col items-center gap-2">
            <span class="text-sm opacity-60">Final Score</span>
            <div :class="result.final_score === 10 ? 'elation-glow' : ''">
              <NProgress
                type="circle"
                :percentage="result.final_score * 10"
                :show-indicator="true"
                :color="scoreColor"
                gap-position="bottom"
              >
                <span class="text-xl font-bold">{{ beautifyNumber(result.final_score, 1) }}</span>
              </NProgress>
            </div>
            <span v-if="scoreText" class="text-sm opacity-60 text-center">{{ scoreText }}</span>
          </div>
          <NDivider />
          <NDataTable
            :columns="columns"
            :data="result.breakdown"
            :bordered="false"
            size="small"
          />
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <NSwitch v-model:value="addNotes" />
              <div class="flex flex-col">
                <span>Add Notes</span>
                <span class="text-xs opacity-50">Send score table data as notes in Anilist</span>
              </div>
            </div>
            <NInput
              v-if="addNotes"
              v-model:value="scoreTableAsNotes"
              type="textarea"
              :autosize="{ minRows: 4 }"
            />
          </div>
          <div class="flex justify-center">
            <NButton type="primary" :loading="isPublishLoading" @click="handlePublish">
              Send to Aha's Record
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
@keyframes elation-pulse {
  0%,
  100% {
    box-shadow: 0 0 12px 4px #63e2b7;
  }
  50% {
    box-shadow: 0 0 24px 10px #06b6d4;
  }
}

.elation-glow {
  border-radius: 50%;
  animation: elation-pulse 2s ease-in-out infinite;
}
</style>

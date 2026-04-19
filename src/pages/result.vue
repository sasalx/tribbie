<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { PublishScoreBody, ResultDimension, ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'
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

const isPublishLoading = ref(false)
const addNotes = ref(false)

const scoreJokes: Record<number, string> = {
  1: 'The bar was on the ground. This tripped over it.',
  2: 'Technically above zero. The least impressive sentence in the English language.',
  3: 'This is what happens when something tries its best and its best is... that.',
  4: 'The Goldilocks of disappointment: not too bad, not too good.',
  5: 'Five out of ten: officially the Switzerland of opinions.',
  6: 'A polite standing ovation. Everyone claps, no one rushes the stage.',
  7: 'Seven is statistically the most popular answer.',
  8: 'Almost perfect — the two missing points just add character.',
  9: 'So close to being the peak.',
  10: 'You either found something truly special, or you are in love. Either way, congratulations.',
}

const scoreJoke = computed(() => {
  if (beautifyNumber(result.final_score, 1) === '3.6') {
    return 'Not great, not terrible.'
  }
  return scoreJokes[Math.round(result.final_score)] ?? ''
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
        }),
  },
  { title: 'Contribution to Final Score', key: 'contribution', align: 'center', titleAlign: 'center', render: row => row.skipped ? '—' : beautifyNumber(row.contribution, 2) },
]
const scoreTableAsNotes = ref(
  [
    `Final Score: ${beautifyNumber(result.final_score, 1)}/10`,
    '',
    ...result.breakdown.map((dimension) => {
      if (dimension.skipped) {
        return `• ${dimension.label}: Skipped`
      }

      const weight = decimalToPercentage(dimension.final_weight)
      return `• ${dimension.label}: ${dimension.score}/10 — weight ${weight}, contribution ${beautifyNumber(dimension.contribution, 2)}`
    }),
  ].join('\n'),
)

async function handlePublish() {
  isPublishLoading.value = true

  await api.post('/score/publish', {
    media_id: result.meta.media_id,
    score: Number(beautifyNumber(result.final_score, 1)),
    notes: addNotes.value ? scoreTableAsNotes.value : '',
  } satisfies PublishScoreBody)

  isPublishLoading.value = false
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
            <NProgress
              type="dashboard"
              :percentage="result.final_score * 10"
              :show-indicator="true"
              :color="scoreColor"
              gap-position="bottom"
            >
              <span class="text-xl font-bold">{{ beautifyNumber(result.final_score, 1) }}</span>
            </NProgress>
            <span v-if="scoreJoke" class="text-sm opacity-60 text-center">{{ scoreJoke }}</span>
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
              Send it to Anilist!
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

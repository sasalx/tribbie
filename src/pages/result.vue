<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { PublishScoreBody, ResultDimension, ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'
import { useNotification } from 'naive-ui'
import { api } from '~/api/client'
import WeightDetail from '~/components/WeightDetail.vue'
import { beautifyNumber, decimalToPercentage } from '~/utils/stringUtils'

const { t } = useI18n()

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

const scoreText = computed(() => {
  if (beautifyNumber(result.final_score, 1) === '3.6') {
    return t('result.scoreTexts.special36')
  }
  return t(`result.scoreTexts.${Math.round(result.final_score)}`)
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
  { title: t('result.columns.dimension'), key: 'label' },
  {
    title: t('result.columns.score'),
    key: 'score',
    align: 'center',
    titleAlign: 'center',
    render: row => row.skipped ? h('span', { class: 'text-red-500' }, t('result.skipped')) : String(row.score),
  },
  {
    title: t('result.columns.weight'),
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
  {
    title: t('result.columns.contribution'),
    key: 'contribution',
    align: 'center',
    titleAlign: 'center',
    render: row => row.skipped ? '—' : beautifyNumber(row.contribution, 2),
  },
]

const scoreTableAsNotes = ref((() => {
  const lines: string[] = [
    t('result.notes.finalScore', { score: beautifyNumber(result.final_score, 1) }),
    t('result.notes.effectiveWeightSum', { sum: beautifyNumber(result.meta.effective_weight_sum) }),
    '',
  ]

  result.breakdown.forEach((dim) => {
    if (dim.skipped) {
      lines.push(t('result.notes.dimensionSkipped', { label: dim.label }))
    }
    else {
      lines.push(t('result.notes.dimensionScore', { label: dim.label, score: dim.score }))
      lines.push(t('result.notes.baseWeight', { value: decimalToPercentage(dim.base_weight) }))
      lines.push(t('result.notes.genreMultiplier', { value: beautifyNumber(dim.applied_multiplier) }))
      lines.push(t('result.notes.effectiveWeight', { value: beautifyNumber(dim.base_weight * dim.applied_multiplier) }))
      lines.push(t('result.notes.finalWeight', { value: decimalToPercentage(dim.final_weight) }))
      lines.push(t('result.notes.contribution', { value: beautifyNumber(dim.contribution, 2) }))
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
  notification.success({ title: t('result.publishSuccess'), description: t('result.publishSuccessDesc'), duration: 5000 })
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
            <span class="text-sm opacity-60">{{ t('result.finalScore') }}</span>
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
                <span>{{ t('result.addNotes') }}</span>
                <span class="text-xs opacity-50">{{ t('result.addNotesDesc') }}</span>
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
              {{ t('result.publishButton') }}
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

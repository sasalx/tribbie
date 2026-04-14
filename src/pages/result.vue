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
}

const isPublishLoading = ref(false)
const addNotes = ref(false)

const columns: DataTableColumns<ResultDimension> = [
  { title: 'Dimension', key: 'label' },
  { title: 'Score', key: 'score' },
  {
    title: 'Weight',
    key: 'final_weight',
    render: row => h(WeightDetail, {
      label: row.label,
      baseWeight: row.base_weight,
      appliedMultiplier: row.applied_multiplier,
      finalWeight: row.final_weight,
      effectiveWeightSum: result.meta.effective_weight_sum,
    }),
  },
  { title: 'Contribution to Final Score', key: 'contribution', align: 'center', titleAlign: 'center' },
]
const scoreTableAsNotes = ref(
  [
    `Final Score: ${beautifyNumber(result.final_score, 2)}/10`,
    '',
    ...result.breakdown.map((dimension) => {
      const weight = decimalToPercentage(dimension.final_weight)
      const skipped = dimension.skipped ? ' [skipped]' : ''
      return `• ${dimension.label}: ${dimension.score}/10 — weight ${weight}, contribution ${dimension.contribution}${skipped}`
    }),
  ].join('\n'),
)

async function handlePublish() {
  isPublishLoading.value = true

  await api.post('/score/publish', {
    media_id: result.meta.media_id,
    score: Number(beautifyNumber(result.final_score, 2)),
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
        <div class="flex flex-col gap-6">
          <MediaHeroSection :data="heroData" />
          <NDivider />
          <div class="flex flex-col items-center gap-2">
            <span class="text-sm opacity-60">Final Score</span>
            <NProgress
              type="dashboard"
              :percentage="result.final_score * 10"
              :show-indicator="true"
              gap-position="bottom"
            >
              <span class="text-xl font-bold">{{ beautifyNumber(result.final_score, 2) }}</span>
            </NProgress>
          </div>
          <NDivider />
          <NDataTable
            :columns="columns"
            :data="result.breakdown"
            :row-props="(row) => ({ style: row.skipped ? 'text-decoration: line-through; opacity: 0.4;' : '' })"
            :bordered="false"
            size="small"
          />
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <NSwitch v-model:value="addNotes" />
              <div class="flex flex-col">
                <span>Add Notes</span>
                <span class="text-xs opacity-50">Send score table data as notes in Anilist in simplified format</span>
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

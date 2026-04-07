<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { ResultDimension, ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'
import WeightDetail from '~/components/WeightDetail.vue'

const state = window.history.state as {
  result: string
  coverImage?: string
  bannerImage?: string
}

const result = JSON.parse(state.result) as ScoreResultResponse
const bannerImage = state.bannerImage

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

const heroData: MediaHeroSectionType = {
  cover_image: state.coverImage ?? '',
  media_type: result.meta.media_type,
  title_romaji: result.meta.title_romaji,
  title_english: result.meta.title_english,
  title_native: '',
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
              <span class="text-xl font-bold">{{ result.final_score.toFixed(2) }}</span>
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
        </div>
      </NCard>
    </div>
  </div>
</template>

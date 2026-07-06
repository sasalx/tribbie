<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { PublishScoreBody, ResultDimension, ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'
import { useNotification } from 'naive-ui'
import { api } from '~/api/client'
import WeightDetail from '~/components/WeightDetail.vue'
import { beautifyNumber, decimalToPercentage, hamiltonPercentages } from '~/utils/stringUtils'
import { fromResultDimension } from '~/utils/weightBreakdown'

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
const notification = useNotification()
const isPublishLoading = ref(false)
const addNotes = ref(false)

const scoreText = computed(() => {
  if (beautifyNumber(result.final_score, 1) === '3.6') {
    return t('result.scoreTexts.special36')
  }
  return t(`result.scoreTexts.${Math.round(result.final_score)}`)
})

const activeDimensions = result.breakdown.filter(d => !d.skipped)
const hamiltonWeightByKey = new Map(
  hamiltonPercentages(activeDimensions.map(d => d.final_weight))
    .map((pct, i) => [activeDimensions[i].key, pct]),
)

const columns: DataTableColumns<ResultDimension> = [
  { title: t('result.columns.dimension'), key: 'label' },
  {
    title: t('result.columns.score'),
    key: 'score',
    align: 'center',
    titleAlign: 'center',
    render: row => row.skipped ? h('span', { class: 'text-danger' }, t('result.skipped')) : String(row.score),
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
          breakdown: fromResultDimension(row, result.meta),
          displayWeight: hamiltonWeightByKey.get(row.key)!,
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
    '',
  ]

  result.breakdown.forEach((dim) => {
    if (dim.skipped) {
      lines.push(t('result.notes.dimensionSkipped', { label: dim.label }))
    }
    else {
      lines.push(t('result.notes.dimension', {
        label: dim.label,
        score: dim.score,
        baseWeight: decimalToPercentage(dim.base_weight),
        finalWeight: decimalToPercentage(dim.final_weight),
        contribution: beautifyNumber(dim.contribution, 2),
      }))
    }
  })

  lines.push('', t('result.notes.footer'))

  return lines.join('\n')
})())

function scoreToColor(finalScore: number): string {
  switch (true) {
    case finalScore === 10: return '#63e2b7' // green
    case finalScore >= 8: return '#a855f7' // purple
    case finalScore >= 6: return '#3b82f6' // blue
    case finalScore >= 4: return '#eab308' // yellow
    default: return '#ef4444' // red
  }
}

async function handlePublish() {
  isPublishLoading.value = true

  await api.post('/v1/score/publish', {
    media_id: result.meta.media_id,
    score: Number(beautifyNumber(result.final_score, 1)),
    notes: addNotes.value ? scoreTableAsNotes.value : '',
  } satisfies PublishScoreBody)

  isPublishLoading.value = false
  notification.success({ title: t('result.publishSuccess'), description: t('result.publishSuccessDesc'), duration: 5000 })
}
</script>

<template>
  <div class="result">
    <BannerImage :src="bannerImage" />

    <div class="result__card-wrapper">
      <NCard bordered>
        <div class="result__card-content">
          <MediaHeroSection :data="heroData" />
          <NDivider />
          <div class="result__score-section">
            <span class="result__score-label">{{ t('result.finalScore') }}</span>
            <div :class="result.final_score === 10 ? 'elation-glow' : ''">
              <NProgress
                type="circle"
                :percentage="result.final_score * 10"
                :show-indicator="true"
                :color="scoreToColor(result.final_score)"
                gap-position="bottom"
              >
                <span class="result__score-value">{{ beautifyNumber(result.final_score, 1) }}</span>
              </NProgress>
            </div>
            <span v-if="scoreText" class="result__score-text">{{ scoreText }}</span>
          </div>
          <NDivider />
          <NDataTable
            :columns="columns"
            :data="result.breakdown"
            :bordered="false"
            size="small"
          />
          <div class="result__notes-section">
            <div class="result__notes-toggle">
              <NSwitch v-model:value="addNotes" />
              <div class="result__notes-toggle-labels">
                <span>{{ t('result.addNotes') }}</span>
                <span class="result__notes-desc">{{ t('result.addNotesDesc') }}</span>
              </div>
            </div>
            <NInput
              v-if="addNotes"
              v-model:value="scoreTableAsNotes"
              type="textarea"
              :autosize="{ minRows: 4 }"
            />
          </div>
          <div class="result__publish-section">
            <NButton type="primary" :loading="isPublishLoading" @click="handlePublish">
              {{ t('result.publishButton') }}
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.result {
  min-height: 100%;

  &__card-wrapper {
    max-width: var(--layout-max-width);
    margin: 0 auto;
    padding: 0 var(--layout-padding);
    margin-top: calc(-1 * var(--space-8));
    padding-bottom: var(--space-12);
    position: relative;
    z-index: var(--z-overlay);
  }

  &__card-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__score-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  &__score-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  &__score-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
  }

  &__score-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    text-align: center;
  }

  &__notes-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__notes-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__notes-toggle-labels {
    display: flex;
    flex-direction: column;
  }

  &__notes-desc {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }

  &__publish-section {
    display: flex;
    justify-content: center;
  }
}

@keyframes elation-pulse {
  0%,
  100% {
    box-shadow: 0 0 12px 4px var(--color-score-perfect);
  }
  50% {
    box-shadow: 0 0 24px 10px var(--color-brand-alt);
  }
}

.elation-glow {
  border-radius: var(--radius-full);
  animation: elation-pulse 2s ease-in-out infinite;
}
</style>

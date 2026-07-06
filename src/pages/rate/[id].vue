<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import type { DimensionsResponse, GenerateScoreBody, ScoreResultResponse, WeightsRequestBody } from '~/types/kansou'
import { useI18n } from 'vue-i18n'
import { api } from '~/api/client'
import WeightDetail from '~/components/WeightDetail.vue'
import { useLiveWeights } from '~/composables/useLiveWeights'
import { hamiltonPercentages } from '~/utils/stringUtils'
import { fromWeightsDimension } from '~/utils/weightBreakdown'

const { t } = useI18n()

interface FieldEntry {
  value: number | null
  skipped: boolean
}

const dimensions = ref<DimensionsResponse | null>(null)
const media = ref<MediaResponse | null>(null)
const fields = ref<Record<string, FieldEntry>>({})
const selectedGenres = ref<string[]>([])
const primaryGenre = ref<string | null>(null)
const loading = ref(true)
const allowSkip = ref(false)

const router = useRouter()
const { id } = useRoute('/rate/[id]').params

onMounted(async () => {
  const [dimensionsData, mediaData] = await Promise.all([
    api.get<DimensionsResponse>('/dimensions'),
    api.get<MediaResponse>(`/media/${id}`),
  ])

  dimensions.value = dimensionsData
  media.value = mediaData
  fields.value = Object.fromEntries(
    dimensionsData.dimensions.map(d => [d.key, { value: null, skipped: false }]),
  )

  loading.value = false
})

const { weights, loading: weightsLoading } = useLiveWeights((): WeightsRequestBody | null => {
  if (!media.value) {
    return null
  }

  return {
    media_id: media.value.id,
    primary_genre: primaryGenre.value ?? '',
    selected_genres: selectedGenres.value,
    skipped_dimensions: Object.fromEntries(
      Object.entries(fields.value).map(([key, field]) => [key, field.skipped]),
    ),
  }
})

const breakdownByKey = computed(() => {
  if (!weights.value) {
    return new Map()
  }
  return new Map(weights.value.dimensions.map(dimension => [
    dimension.key,
    fromWeightsDimension(dimension, weights.value!.primary_genre_weight, weights.value!.effective_weight_sum),
  ]))
})

const hamiltonWeightByKey = computed(() => {
  const liveBreakdownEntries = [...breakdownByKey.value.entries()]

  if (liveBreakdownEntries.length > 0) {
    const percentages = hamiltonPercentages(liveBreakdownEntries.map(([, breakdown]) => breakdown.finalWeight))
    return new Map(liveBreakdownEntries.map(([key], i) => [key, percentages[i]]))
  }

  if (!dimensions.value) {
    return new Map<string, string>()
  }

  const staticDimensions = dimensions.value.dimensions
  const percentages = hamiltonPercentages(staticDimensions.map(dimension => dimension.weight))

  return new Map(staticDimensions.map((dimension, index) => [dimension.key, percentages[index]]))
})

// Submit logic
const canSubmit = computed(() =>
  selectedGenres.value.length > 0
  && Object.values(fields.value).every(field => field.skipped || field.value !== null),
)

async function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  const result = await api.post<ScoreResultResponse>('/score', {
    media_id: Number(id),
    scores: Object.fromEntries(
      Object.entries(fields.value)
        .filter(([, field]) => !field.skipped)
        .map(([key, field]) => [key, field.value]),
    ) as Record<string, number>,
    primary_genre: primaryGenre.value ?? '',
    selected_genres: selectedGenres.value,
  } satisfies GenerateScoreBody)

  await router.push({
    path: '/result',
    state: {
      result: JSON.stringify(result),
      coverImage: media.value?.cover_image,
      bannerImage: media.value?.banner_image,
    },
  })
}
</script>

<template>
  <div class="rate">
    <BannerImage :src="loading ? undefined : media?.banner_image" />

    <div class="rate__card-wrapper">
      <NCard bordered>
        <template v-if="loading">
          <div class="rate__skeleton">
            <div class="rate__skeleton-hero">
              <NSkeleton height="180px" width="120px" :sharp="false" />
              <div class="rate__skeleton-hero-info">
                <NSkeleton height="28px" width="60%" :sharp="false" />
                <NSkeleton height="16px" width="40%" :sharp="false" />
              </div>
            </div>
            <NDivider class="rate__divider--flush" />
            <div class="rate__skeleton-genres">
              <div class="rate__skeleton-field">
                <NSkeleton height="16px" width="120px" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
              <div class="rate__skeleton-field">
                <NSkeleton height="16px" width="120px" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
            </div>
            <NDivider class="rate__divider--flush" />
            <div class="rate__skeleton-fields">
              <div v-for="i in 4" :key="i" class="rate__skeleton-field">
                <NSkeleton height="16px" width="30%" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
              <NSkeleton height="34px" :sharp="false" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="rate__content">
            <MediaHeroSection :data="media!" />
            <NDivider />
            <GenreSelector
              v-model:dropdown="primaryGenre"
              v-model:tags="selectedGenres"
              :genres="media!.genres"
            />
            <NDivider />
            <div class="rate__skip-toggle">
              <NSwitch v-model:value="allowSkip" />
              <span>{{ t('rate.allowSkipping') }}</span>
            </div>
            <NForm label-placement="top" :disabled="selectedGenres.length === 0">
              <NFormItem
                v-for="dimension in dimensions?.dimensions"
                :key="dimension.key"
                :label="dimension.label"
              >
                <div class="rate__field">
                  <span class="rate__field-description">{{ dimension.description }}</span>
                  <NInputGroup>
                    <NInputNumber
                      v-model:value="fields[dimension.key].value"
                      class="rate__field-input"
                      :min="0"
                      :max="10"
                      :step="0.5"
                      :disabled="fields[dimension.key].skipped"
                      :placeholder="t('rate.inputPlaceholder')"
                    />
                    <NInputGroupLabel class="rate__weight-label">
                      <WeightDetail
                        v-if="breakdownByKey.get(dimension.key)"
                        :label="dimension.label"
                        :breakdown="breakdownByKey.get(dimension.key)!"
                        :display-weight="hamiltonWeightByKey.get(dimension.key)!"
                        should-change-colour
                      />
                      <NSpin v-else-if="weightsLoading" :size="14" />
                    </NInputGroupLabel>
                  </NInputGroup>
                  <NCheckbox
                    v-if="allowSkip"
                    v-model:checked="fields[dimension.key].skipped"
                    class="rate__field-checkbox"
                  >
                    {{ t('rate.skipCheckbox') }}
                  </NCheckbox>
                </div>
              </NFormItem>
              <NButton type="primary" block :disabled="!canSubmit" @click="handleSubmit">
                {{ t('rate.submitButton') }}
              </NButton>
            </NForm>
          </div>
        </template>
      </NCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rate {
  min-height: 100%;

  &__card-wrapper {
    max-width: var(--layout-max-width);
    margin: 0 auto;
    padding: 0 var(--layout-padding);
    margin-top: calc(-1 * var(--space-12));
    padding-bottom: var(--space-12);
    position: relative;
    z-index: var(--z-overlay);
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  &__skeleton-hero {
    display: flex;
    gap: var(--space-4);
  }

  &__skeleton-hero-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
    padding-top: var(--space-2);
  }

  &__skeleton-genres {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__skeleton-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__skeleton-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__divider--flush {
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__skip-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  &__field-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    padding-left: 2px;
  }

  &__field-input {
    width: 100%;
  }

  &__weight-label {
    width: calc(3ch + 2rem);
    text-align: center;
  }

  &__field-checkbox {
    margin-top: var(--space-1);
  }
}
</style>

<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import type { DimensionsResponse, GenerateScoreBody, ScoreResultResponse } from '~/types/kansou'
import { api } from '~/api/client'
import { decimalToPercentage } from '~/utils/stringUtils'

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

const canSubmit = computed(() =>
  selectedGenres.value.length > 0
  && Object.values(fields.value).every(field => field.skipped || field.value !== null),
)

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
  <div class="min-h-full">
    <BannerImage :src="loading ? undefined : media?.banner_image" />

    <div class="max-w-3xl mx-auto px-4 -mt-12 pb-12 relative z-10">
      <NCard bordered>
        <template v-if="loading">
          <div class="flex flex-col gap-6">
            <div class="flex gap-4">
              <NSkeleton height="180px" width="120px" :sharp="false" />
              <div class="flex flex-col gap-2 flex-1 pt-2">
                <NSkeleton height="28px" width="60%" :sharp="false" />
                <NSkeleton height="16px" width="40%" :sharp="false" />
              </div>
            </div>
            <NDivider class="my-0" />
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <NSkeleton height="16px" width="120px" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
              <div class="flex flex-col gap-2">
                <NSkeleton height="16px" width="120px" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
            </div>
            <NDivider class="my-0" />
            <div class="flex flex-col gap-4">
              <div v-for="i in 4" :key="i" class="flex flex-col gap-2">
                <NSkeleton height="16px" width="30%" :sharp="false" />
                <NSkeleton height="34px" :sharp="false" />
              </div>
              <NSkeleton height="34px" :sharp="false" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col">
            <MediaHeroSection :data="media!" />
            <NDivider />
            <GenreSelector
              v-model:dropdown="primaryGenre"
              v-model:tags="selectedGenres"
              :genres="media!.genres"
            />
            <NDivider />
            <div class="flex items-center gap-2 mb-4">
              <NSwitch v-model:value="allowSkip" />
              <span>Allow Skipping</span>
            </div>
            <NForm label-placement="top" :disabled="selectedGenres.length === 0">
              <NFormItem
                v-for="dimension in dimensions?.dimensions"
                :key="dimension.key"
                :label="dimension.label"
              >
                <div class="flex flex-col gap-1 w-full">
                  <span class="text-xs opacity-60 pl-0.5">{{ dimension.description }}</span>
                  <NInputGroup>
                    <NInputNumber
                      v-model:value="fields[dimension.key].value"
                      class="w-full"
                      :min="0"
                      :max="10"
                      :step="0.5"
                      :disabled="fields[dimension.key].skipped"
                      placeholder="Enter a value"
                    />
                    <NInputGroupLabel class="w-[calc(3ch+2rem)] text-center">
                      {{ decimalToPercentage(dimension.weight) }}
                    </NInputGroupLabel>
                  </NInputGroup>
                  <NCheckbox
                    v-if="allowSkip"
                    v-model:checked="fields[dimension.key].skipped"
                    class="mt-1"
                  >
                    Skip this dimension
                  </NCheckbox>
                </div>
              </NFormItem>
              <NButton type="primary" block :disabled="!canSubmit" @click="handleSubmit">
                Score!
              </NButton>
            </NForm>
          </div>
        </template>
      </NCard>
    </div>
  </div>
</template>

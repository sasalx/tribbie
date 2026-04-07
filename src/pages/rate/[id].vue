<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import type { DimensionsResponse, ReviewEntry, ScoreResultResponse } from '~/types/kansou'
import { api } from '~/api/client'
import { decimalToPercentage } from '~/utils/stringUtils'

const dimensions = ref<DimensionsResponse | null>(null)
const media = ref<MediaResponse | null>(null)
const values = ref<Record<string, number | null>>({})
const primaryGenre = ref<string | null>(null)
const selectedGenres = ref<string[]>([])
const loading = ref(true)

const canSubmit = computed(() =>
  selectedGenres.value.length > 0
  && Object.values(values.value).every(v => v !== null),
)

const router = useRouter()
const { id } = useRoute('/rate/[id]').params

onMounted(async () => {
  const [dimensionsData, mediaData] = await Promise.all([
    api.get<DimensionsResponse>('/dimensions'),
    api.get<MediaResponse>(`/media/${id}`),
  ])
  dimensions.value = dimensionsData
  media.value = mediaData
  values.value = Object.fromEntries(
    dimensionsData.dimensions.map(d => [d.key, null]),
  )
  loading.value = false
})

async function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  const result = await api.post<ScoreResultResponse>('/score', {
    media_id: Number(id),
    scores: values.value as Record<string, number>,
    primary_genre: primaryGenre.value ?? '',
    selected_genres: selectedGenres.value,
  } satisfies ReviewEntry)

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
    <div class="w-full overflow-hidden">
      <NSkeleton v-if="loading" height="192px" :sharp="false" />
      <NImage
        v-else
        :src="media?.banner_image"
        preview-disabled
        width="100%"
        height="100%"
        object-fit="cover"
        class="w-full"
      />
    </div>

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
                      v-model:value="values[dimension.key]"
                      class="w-full"
                      :min="0"
                      :max="10"
                      :step="0.5"
                      placeholder="Enter a value"
                    />
                    <NInputGroupLabel class="w-[calc(3ch+2rem)] text-center">
                      {{ decimalToPercentage(dimension.weight) }}
                    </NInputGroupLabel>
                  </NInputGroup>
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

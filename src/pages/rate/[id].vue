<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import type { DimensionsResponse } from '~/types/kansou'
import { api } from '~/api/client'
import { decimalToPercentage } from '~/utils/stringUtils'

const dimensions = ref<DimensionsResponse | null>(null)
const media = ref<MediaResponse | null>(null)
const values = ref<Record<string, number | null>>({})
const primaryGenre = ref<string | null>(null)
const selectedGenres = ref<string[]>([])

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
})

async function handleSubmit() {
}
</script>

<template>
  <MediaHeroSection v-if="media" :data="media" />
  <NDivider />
  <GenreSelector v-if="media" v-model:dropdown="primaryGenre" v-model:tags="selectedGenres" :genres="media.genres" class="max-w-400px" />
  <NDivider />
  <NForm label-placement="top" class="max-w-400px" :disabled="selectedGenres.length === 0">
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
    <NButton type="primary" block :disabled="selectedGenres.length === 0" @click="handleSubmit">
      Submit
    </NButton>
  </NForm>
</template>

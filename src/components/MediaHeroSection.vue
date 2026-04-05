<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import { displayAltMediaTitle } from '~/utils/stringUtils'

defineProps<{
  data: MediaResponse
}>()

const cardImageSize = {
  width: 120,
  height: 180,
}
</script>

<template>
  <div class="flex items-center gap-4">
    <NImage
      :src="data.cover_image"
      :alt="data.title_romaji"
      :width="cardImageSize.width"
      :height="cardImageSize.height"
      object-fit="cover"
      class="rounded"
    />
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold">
        {{ data.title_romaji }}
      </h1>
      <span class="text-sm opacity-60">{{ displayAltMediaTitle(data.title_english, data.title_native) }}</span>
    </div>
  </div>
</template>

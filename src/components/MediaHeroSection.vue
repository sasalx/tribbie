<script setup lang="ts">
import type { MediaHeroSectionType } from '~/types/tribbie'
import { displayAltMediaTitle, toFirstLetterCapitalString } from '~/utils/stringUtils'

defineProps<{
  data: MediaHeroSectionType
}>()

function openAnilistUrl(url: string) {
  window.open(url, '_blank')
}

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
      <NTag type="info" :bordered="false" size="small" class="self-start">
        {{ toFirstLetterCapitalString(data.media_type) }}
      </NTag>
      <h1
        class="text-2xl font-bold cursor-pointer hover:underline"
        @click="openAnilistUrl(data.anilist_url)"
      >
        {{ data.title_romaji }}
      </h1>
      <span class="text-sm opacity-60">{{ displayAltMediaTitle(data.title_english, data.title_native) }}</span>
    </div>
  </div>
</template>

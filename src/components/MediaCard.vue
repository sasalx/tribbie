<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'
import { displayAltMediaTitle, toFirstLetterCapitalString } from '~/utils/stringUtils'

const props = defineProps<{
  data: MediaResponse
}>()
const router = useRouter()

const cardImageSize = {
  width: 120,
  height: 180,
}

function handleClick() {
  router.push(`/rate/${props.data.id}`)
}
</script>

<template>
  <NCard hoverable class="cursor-pointer" @click="handleClick">
    <div class="flex gap-4">
      <NImage
        :src="data.cover_image"
        :alt="data.title_romaji"
        :width="cardImageSize.width"
        :height="cardImageSize.height"
        object-fit="cover"
        class="rounded"
        @click.stop
      />
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-semibold leading-tight">
          {{ data.title_romaji }}
        </h2>
        <span class="text-xs opacity-60">{{ displayAltMediaTitle(data.title_english, data.title_native) }}</span>

        <div class="flex flex-col gap-1 mt-1">
          <span class="text-xs opacity-50">Type</span>
          <NTag :type="data.media_type === 'ANIME' ? 'info' : 'warning'" :bordered="false" size="small" class="self-start">
            {{ toFirstLetterCapitalString(data.media_type) }}
          </NTag>
        </div>

        <div class="flex flex-col gap-1 mt-1">
          <span class="text-xs opacity-50">Genres</span>
          <div class="flex flex-wrap gap-1">
            <NTag v-for="genre in data.genres" :key="genre" :bordered="false" size="small">
              {{ genre }}
            </NTag>
          </div>
        </div>
      </div>
    </div>
  </NCard>
</template>

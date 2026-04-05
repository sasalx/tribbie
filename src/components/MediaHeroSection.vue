<script setup lang="ts">
import type { MediaResponse } from '~/types/anilist'

defineProps<{
  data: MediaResponse
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <img
      :src="data.cover_image"
      :alt="data.title_english || data.title_romaji"
      class="w-24 h-36 object-cover rounded"
    >
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold">
        {{ data.title_english || data.title_romaji }}
      </h1>
      <span class="text-sm opacity-60">{{ `${data.title_romaji} / ${data.title_native}` }}</span>
    </div>
  </div>
</template>

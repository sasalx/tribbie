<script setup lang="ts">
import type { MediaResponse, MediaType } from '~/types/anilist'
import { api } from '~/api/client'

const query = ref('')
const mediaType = ref<MediaType | null>(null)
const results = ref<MediaResponse[]>([])

const hasResults = computed(() => results.value.length > 0)

function toggleMediaType(type: MediaType) {
  mediaType.value = mediaType.value === type ? null : type
}

async function handleSearch() {
  results.value = await api.get<MediaResponse[]>('/media/search', {
    params: {
      q: query.value,
      ...(mediaType.value && { type: mediaType.value }),
    },
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSearch()
  }
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="flex flex-col items-center gap-6 transition-all duration-500 ease-in-out"
      :class="hasResults ? 'pt-8' : 'pt-[28vh]'"
    >
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-3xl font-semibold">
          What are you looking for?
        </h1>
        <p class="text-sm opacity-50">
          Search for anime or manga to rate.
        </p>
        <NRadioGroup :value="mediaType">
          <NRadioButton value="ANIME" @click.prevent="toggleMediaType('ANIME')">
            Anime
          </NRadioButton>
          <NRadioButton value="MANGA" @click.prevent="toggleMediaType('MANGA')">
            Manga
          </NRadioButton>
        </NRadioGroup>
      </div>

      <div class="w-full max-w-2xl flex flex-col gap-2">
        <NInput
          v-model:value="query"
          placeholder="Search anime, manga..."
          size="large"
          @keydown="handleKeydown"
        />
        <div class="flex justify-end">
          <NButton
            type="primary"
            :disabled="!query.trim()"
            @click="handleSearch"
          >
            Search
          </NButton>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-500 ease-in-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="hasResults" class="mt-12 px-8 w-full self-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto flex-1 pb-6 content-start">
        <MediaCard v-for="result in results" :key="result.id" :data="result" />
      </div>
    </Transition>
  </div>
</template>

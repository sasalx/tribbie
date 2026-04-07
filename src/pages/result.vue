<script setup lang="ts">
import type { ScoreResultResponse } from '~/types/kansou'
import type { MediaHeroSectionType } from '~/types/tribbie'

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
}
</script>

<template>
  <div class="min-h-full">
    <BannerImage :src="bannerImage" />

    <div class="max-w-3xl mx-auto px-4 -mt-8 pb-12 relative z-10">
      <NCard bordered>
        <div class="flex flex-col gap-6">
          <MediaHeroSection :data="heroData" />
        </div>
      </NCard>
    </div>
  </div>
</template>

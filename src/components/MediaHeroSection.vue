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
  <div class="media-hero">
    <NImage
      :src="data.cover_image"
      :alt="data.title_romaji"
      :width="cardImageSize.width"
      :height="cardImageSize.height"
      object-fit="cover"
      class="media-hero__cover"
    />
    <div class="media-hero__info">
      <NTag type="info" :bordered="false" size="small" class="media-hero__type">
        {{ toFirstLetterCapitalString(data.media_type) }}
      </NTag>
      <h1 class="media-hero__title" @click="openAnilistUrl(data.anilist_url)">
        {{ data.title_romaji }}
      </h1>
      <span class="media-hero__subtitle">{{ displayAltMediaTitle(data.title_english, data.title_native) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.media-hero {
  display: flex;
  align-items: center;
  gap: var(--space-4);

  &__cover {
    border-radius: var(--radius-sm);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__type {
    align-self: flex-start;
  }

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
}
</style>

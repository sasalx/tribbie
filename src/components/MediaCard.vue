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
  <NCard hoverable class="media-card" @click="handleClick">
    <div class="media-card__content">
      <NImage
        :src="data.cover_image"
        :alt="data.title_romaji"
        :width="cardImageSize.width"
        :height="cardImageSize.height"
        object-fit="cover"
        class="media-card__cover"
        @click.stop
      />
      <div class="media-card__info">
        <h2 class="media-card__title">
          {{ data.title_romaji }}
        </h2>
        <span class="media-card__subtitle">{{ displayAltMediaTitle(data.title_english, data.title_native) }}</span>

        <div class="media-card__meta">
          <span class="media-card__meta-label">Type</span>
          <NTag :type="data.media_type === 'ANIME' ? 'info' : 'warning'" :bordered="false" size="small" class="media-card__type-tag">
            {{ toFirstLetterCapitalString(data.media_type) }}
          </NTag>
        </div>

        <div class="media-card__meta">
          <span class="media-card__meta-label">Genres</span>
          <div class="media-card__genres">
            <NTag v-for="genre in data.genres" :key="genre.Name" :bordered="false" size="small">
              {{ toFirstLetterCapitalString(genre.Name) }}
            </NTag>
          </div>
        </div>
      </div>
    </div>
  </NCard>
</template>

<style lang="scss" scoped>
.media-card {
  cursor: pointer;

  &__content {
    display: flex;
    gap: var(--space-4);
  }

  &__cover {
    border-radius: var(--radius-sm);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 600;
    line-height: 1.25;
  }

  &__subtitle {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-top: var(--space-1);
  }

  &__meta-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }

  &__type-tag {
    align-self: flex-start;
  }

  &__genres {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }
}
</style>

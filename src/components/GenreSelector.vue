<script setup lang="ts">
import type { SelectRenderTag } from 'naive-ui'
import type { Genre } from '~/types/anilist'
import { NTag } from 'naive-ui'
import { toFirstLetterCapitalString } from '~/utils/stringUtils'

const props = defineProps<{
  genres: Genre[]
}>()

const { t } = useI18n()

const primaryGenre = defineModel<string | null>('dropdown', { default: null })
const selectedGenres = defineModel<string[]>('tags', { default: () => [] })

const options = computed(() =>
  props.genres.map(genre => ({ label: toFirstLetterCapitalString(genre.Name), value: genre.Name })),
)
const hasError = computed(() => selectedGenres.value.length === 0)

watch(
  () => props.genres,
  (genres) => { selectedGenres.value = genres.map(genre => genre.Name) },
  { immediate: true },
)

watch(primaryGenre, (genre) => {
  if (genre && !selectedGenres.value.includes(genre)) {
    selectedGenres.value = withPrimaryFirst([genre, ...selectedGenres.value])
  }
  else {
    selectedGenres.value = withPrimaryFirst(selectedGenres.value)
  }
})

function withPrimaryFirst(genres: string[]): string[] {
  if (!primaryGenre.value) {
    return genres
  }
  return [primaryGenre.value, ...genres.filter(g => g !== primaryGenre.value)]
}

function handleUpdateSelectedGenres(value: string[]) {
  if (primaryGenre.value && !value.includes(primaryGenre.value)) {
    selectedGenres.value = [primaryGenre.value, ...value]
  }
  else {
    selectedGenres.value = withPrimaryFirst(value)
  }
}

const renderTag: SelectRenderTag = ({ option, handleClose }) => {
  const isPrimary = option.value === primaryGenre.value
  return h(
    NTag,
    { type: isPrimary ? 'success' : 'info', closable: !isPrimary, onClose: handleClose },
    { default: () => option.label },
  )
}
</script>

<template>
  <div class="genre-selector">
    <div class="genre-selector__field">
      <span class="genre-selector__label">{{ t('genreSelector.primaryGenreLabel') }}</span>
      <NSelect
        v-model:value="primaryGenre"
        clearable
        :options="options"
        :placeholder="t('genreSelector.primaryGenrePlaceholder')"
      />
    </div>
    <div class="genre-selector__field">
      <span class="genre-selector__label">{{ t('genreSelector.selectedGenresLabel') }}</span>
      <NSelect
        :value="selectedGenres"
        multiple
        :options="options"
        :render-tag="renderTag"
        :status="hasError ? 'error' : undefined"
        :placeholder="t('genreSelector.selectedGenresPlaceholder')"
        @update:value="handleUpdateSelectedGenres"
      />
      <span v-if="hasError" class="genre-selector__error">
        {{ t('genreSelector.genreRequired') }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.genre-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__label {
    font-size: var(--font-size-sm);
  }

  &__error {
    font-size: var(--font-size-xs);
    color: var(--color-danger);
  }
}
</style>

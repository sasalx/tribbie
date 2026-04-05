<script setup lang="ts">
import type { SelectRenderTag } from 'naive-ui'
import { NTag } from 'naive-ui'

const props = defineProps<{
  genres: string[]
}>()

const primaryGenre = defineModel<string | null>('dropdown', { default: null })
const selectedGenres = defineModel<string[]>('tags', { default: () => [] })

const options = computed(() =>
  props.genres.map(genre => ({ label: genre, value: genre })),
)
const hasError = computed(() => selectedGenres.value.length === 0)

watch(
  () => props.genres,
  (genres) => { selectedGenres.value = [...genres] },
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
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <span class="text-sm">Primary Genre (optional)</span>
      <NSelect
        v-model:value="primaryGenre"
        clearable
        :options="options"
        placeholder="Select a genre"
      />
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-sm">Selected Genres</span>
      <NSelect
        :value="selectedGenres"
        multiple
        :options="options"
        :render-tag="renderTag"
        :status="hasError ? 'error' : undefined"
        placeholder="Select genres"
        @update:value="handleUpdateSelectedGenres"
      />
      <span v-if="hasError" class="text-xs text-red-500">
        At least one genre must be selected.
      </span>
    </div>
  </div>
</template>

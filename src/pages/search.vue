<script setup lang="ts">
import type { MediaResponse, MediaType } from '~/types/anilist'
import { api } from '~/api/client'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const query = ref(String(route.query.q ?? ''))
const mediaType = ref<MediaType | null>((route.query.type as MediaType) ?? null)
const results = ref<MediaResponse[]>([])
const loading = ref(false)

const hasResults = computed(() => results.value.length > 0)

function toggleMediaType(type: MediaType) {
  mediaType.value = mediaType.value === type ? null : type
}

async function handleSearch() {
  loading.value = true
  await router.replace({
    query: {
      ...route.query,
      q: query.value,
      ...(mediaType.value ? { type: mediaType.value } : { type: undefined }),
    },
  })
  results.value = await api.get<MediaResponse[]>('/media/search', {
    params: {
      q: query.value,
      ...(mediaType.value && { type: mediaType.value }),
    },
  })
  loading.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSearch()
  }
}

if (query.value) {
  handleSearch()
}
</script>

<template>
  <div class="search">
    <div class="search__header" :class="hasResults ? 'search__header--compact' : 'search__header--centered'">
      <div class="search__title-group">
        <h1 class="search__title">
          {{ t('search.title') }}
        </h1>
        <p class="search__subtitle">
          {{ t('search.subtitle') }}
        </p>
        <NRadioGroup :value="mediaType">
          <NRadioButton value="ANIME" @click.prevent="toggleMediaType('ANIME')">
            {{ t('search.anime') }}
          </NRadioButton>
          <NRadioButton value="MANGA" @click.prevent="toggleMediaType('MANGA')">
            {{ t('search.manga') }}
          </NRadioButton>
        </NRadioGroup>
      </div>
      <div class="search__controls">
        <NInput
          v-model:value="query"
          :placeholder="t('search.inputPlaceholder')"
          size="large"
          :loading="loading"
          @keydown="handleKeydown"
        />
        <div class="search__actions">
          <NButton type="primary" :disabled="!query.trim()" @click="handleSearch">
            {{ t('search.searchButton') }}
          </NButton>
        </div>
      </div>
    </div>

    <Transition name="results-slide">
      <div v-if="hasResults" class="search__results">
        <MediaCard v-for="result in results" :key="result.id" :data="result" />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.search {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0 var(--space-4);

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    transition: padding-top 0.5s ease-in-out;

    &--centered {
      padding-top: 28vh;
    }

    &--compact {
      padding-top: var(--space-8);
    }
  }

  &__title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  &__title {
    font-size: var(--font-size-3xl);
    font-weight: 600;
  }

  &__subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-subtle);
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
    max-width: 672px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__results {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-2);
    margin-top: var(--space-12);
    padding-bottom: var(--space-6);
    overflow-y: auto;
    flex: 1;
    align-content: start;
    align-self: center;
    width: 100%;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 1280px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

.results-slide-enter-active {
  transition: all 0.5s ease-in-out;
}

.results-slide-enter-from {
  opacity: 0;
  transform: translateY(var(--space-4));
}

.results-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>

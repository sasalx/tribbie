<script setup lang="ts">
import type { ConfigResponse } from '~/types/kansou'
import { api } from '~/api/client'
import DimensionsTab from '~/components/settings/DimensionsTab.vue'
import GeneralTab from '~/components/settings/GeneralTab.vue'
import GenresTab from '~/components/settings/GenresTab.vue'

const { t } = useI18n()

const activeTab = ref('general')
const config = ref<ConfigResponse | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  config.value = await api.get<ConfigResponse>('/v1/config')
  isLoading.value = false
})
</script>

<template>
  <div class="settings">
    <h1 class="settings__title">
      {{ t('settings.title') }}
    </h1>
    <NSpin v-if="isLoading" />
    <NTabs v-else v-model:value="activeTab" type="line" animated>
      <NTabPane name="general" :tab="t('settings.tabs.general')">
        <GeneralTab :config="config!" />
      </NTabPane>
      <NTabPane name="dimensions" :tab="t('settings.tabs.dimensions')">
        <DimensionsTab :config="config!" />
      </NTabPane>
      <NTabPane name="genres" :tab="t('settings.tabs.genres')">
        <GenresTab :config="config!" />
      </NTabPane>
    </NTabs>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }
}
</style>

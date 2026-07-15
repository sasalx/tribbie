<script setup lang="ts">
import type { ConfigDimension, ConfigResponse, DbInfo } from '~/types/kansou'
import { useMessage } from 'naive-ui'
import { api } from '~/api/client'
import DimensionsTab from '~/components/settings/DimensionsTab.vue'
import GeneralTab from '~/components/settings/GeneralTab.vue'
import GenresTab from '~/components/settings/GenresTab.vue'

const { t } = useI18n()
const message = useMessage()

const activeTab = ref('general')
const config = ref<ConfigResponse | null>(null)
const dbInfo = ref<DbInfo | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

onMounted(async () => {
  dbInfo.value = await api.get<DbInfo>('/v1/db-info')

  if (dbInfo.value.db === 'sqlite') {
    config.value = await api.get<ConfigResponse>('/v1/config')
  }

  isLoading.value = false
})

function handleDimensionsUpdate(dimensions: Record<string, ConfigDimension>) {
  if (config.value) {
    config.value.dimensions = dimensions
  }
}

async function handleSave() {
  isSaving.value = true

  try {
    config.value = await api.post<ConfigResponse>('/v1/config', config.value)
  }
  catch {
    message.error(t('settings.saveError'))
  }
  finally {
    isSaving.value = false
    message.success(t('settings.saveSuccess'))
  }
}
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1 class="settings__title">
        {{ t('settings.title') }}
      </h1>
      <NButton
        v-if="!isLoading && dbInfo?.db === 'sqlite'"
        type="primary"
        :loading="isSaving"
        @click="handleSave"
      >
        {{ t('settings.saveButton') }}
      </NButton>
    </div>

    <NSpin v-if="isLoading" />

    <NResult
      v-else-if="dbInfo?.db !== 'sqlite'"
      status="403"
      :title="t('settings.unsupportedDb.title')"
      :description="t('settings.unsupportedDb.description')"
    />

    <NTabs v-else v-model:value="activeTab" type="line" animated>
      <NTabPane name="general" :tab="t('settings.tabs.general')">
        <GeneralTab :config="config!" />
      </NTabPane>
      <NTabPane name="dimensions" :tab="t('settings.tabs.dimensions')">
        <DimensionsTab :config="config!" @update:dimensions="handleDimensionsUpdate" />
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

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }
}
</style>

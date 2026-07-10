<script setup lang="ts">
import type { ConfigDimension, ConfigResponse } from '~/types/kansou'
import { ChevronDownOutline } from '@vicons/ionicons5'

const props = defineProps<{ config: ConfigResponse }>()

const { t } = useI18n()

const localDimensions = ref<Record<string, ConfigDimension>>(JSON.parse(JSON.stringify(props.config.dimensions)))
const expandedKey = ref<string | null>(null)
const confirmDeleteKey = ref<string | null>(null)

const orderedKeys = computed(() => props.config.dimension_order.filter(key => key in localDimensions.value))
const weightSum = computed(() => {
  const sum = Object.values(localDimensions.value).reduce((total, dimension) => total + dimension.weight, 0)

  return { value: sum, ok: Math.abs(sum - 1) <= 0.005 }
})

const errors = computed(() => {
  const result: string[] = []
  if (weightSum.value.value > 1.005) {
    result.push(t('settings.dimensions.errorTotalExceeds'))
  }
  if (orderedKeys.value.length === 0) {
    result.push(t('settings.dimensions.errorNoDimensions'))
  }
  return result
})

function toggleExpand(key: string) {
  if (expandedKey.value === key) {
    expandedKey.value = null
    confirmDeleteKey.value = null
  }
  else {
    expandedKey.value = key
    confirmDeleteKey.value = null
  }
}

function handleDeleteClick(key: string) {
  confirmDeleteKey.value = key
}

function handleDeleteCancel() {
  confirmDeleteKey.value = null
}

function handleDeleteConfirm(key: string) {
  delete localDimensions.value[key]
  expandedKey.value = null
  confirmDeleteKey.value = null
}

function updateWeight(key: string, value: number | null) {
  if (value !== null) {
    localDimensions.value[key].weight = value
  }
}
</script>

<template>
  <div class="dimensions-tab">
    <div class="dimensions-tab__header">
      <div class="dimensions-tab__header-left">
        <span class="dimensions-tab__title">{{ t('settings.dimensions.title') }}</span>
        <span class="dimensions-tab__subtitle">{{ t('settings.dimensions.subtitle', { count: orderedKeys.length }) }}</span>
      </div>
      <div class="dimensions-tab__header-right">
        <div class="dimensions-tab__header-right-top">
          <span
            class="dimensions-tab__sum-badge"
            :class="{ 'dimensions-tab__sum-badge--ok': weightSum.ok }"
          >
            Σ {{ weightSum.value.toFixed(2) }}
          </span>
          <NButton size="small" type="primary" round>
            {{ t('settings.dimensions.addButton') }}
          </NButton>
        </div>
        <div v-if="errors.length > 0" class="dimensions-tab__errors">
          <span v-for="error in errors" :key="error" class="dimensions-tab__error">{{ error }}</span>
        </div>
      </div>
    </div>

    <div v-for="key in orderedKeys" :key="key" class="dimensions-tab__card">
      <div class="dimensions-tab__card-header" @click="toggleExpand(key)">
        <div class="dimensions-tab__card-label-group">
          <span class="dimensions-tab__card-label">{{ localDimensions[key].label }}</span>
          <span class="dimensions-tab__card-weight-pill">{{ Math.round(localDimensions[key].weight * 100) }}%</span>
        </div>
        <NIcon
          size="16"
          class="dimensions-tab__chevron"
          :class="{ 'dimensions-tab__chevron--open': expandedKey === key }"
        >
          <ChevronDownOutline />
        </NIcon>
      </div>

      <template v-if="expandedKey === key">
        <div class="dimensions-tab__card-body">
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.descriptionLabel') }}</span>
            <NInput
              v-model:value="localDimensions[key].description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 2 }"
            />
          </div>
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.weightLabel') }}</span>
            <NInputNumber
              class="dimensions-tab__weight-input"
              :value="localDimensions[key].weight"
              :step="0.01"
              :min="0"
              :max="1"
              @update:value="(value) => updateWeight(key, value)"
            />
          </div>
          <div class="dimensions-tab__bias-row">
            <NSwitch v-model:value="localDimensions[key].bias_resistant" />
            <div class="dimensions-tab__bias-label">
              <span>{{ t('settings.dimensions.biasResistant') }}</span>
              <span class="dimensions-tab__bias-hint">{{ t('settings.dimensions.biasResistantHint') }}</span>
            </div>
          </div>
          <NDivider />
          <div v-if="confirmDeleteKey !== key" class="dimensions-tab__delete">
            <NButton text type="error" @click="handleDeleteClick(key)">
              {{ t('settings.dimensions.deleteButton') }}
            </NButton>
          </div>
          <div v-else class="dimensions-tab__delete-confirm">
            <span class="dimensions-tab__delete-confirm-text">{{ t('settings.dimensions.deleteConfirm') }}</span>
            <div class="dimensions-tab__delete-confirm-actions">
              <NButton size="small" @click="handleDeleteCancel">
                {{ t('settings.dimensions.deleteCancel') }}
              </NButton>
              <NButton size="small" type="error" @click="handleDeleteConfirm(key)">
                {{ t('settings.dimensions.deleteConfirmButton') }}
              </NButton>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dimensions-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  &__header-left {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 12px;
    color: var(--color-text-subtle);
  }

  &__header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  &__header-right-top {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__errors {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
  }

  &__error {
    font-size: var(--font-size-xs);
    color: var(--color-danger);
  }

  &__sum-badge {
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 2px 10px;
    border-radius: var(--radius-full);
    background: var(--color-warning-subtle);
    color: var(--color-warning);
    transition:
      background 0.2s,
      color 0.2s;

    &--ok {
      background: var(--color-success-subtle);
      color: var(--color-success);
    }
  }

  &__card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    overflow: hidden;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    user-select: none;

    &:hover {
      background: var(--color-surface-hover);
    }
  }

  &__card-label-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__card-label {
    font-size: 14px;
    font-weight: 600;
  }

  &__card-weight-pill {
    font-size: var(--font-size-xs);
    padding: 1px 8px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    color: var(--color-text-subtle);
  }

  &__chevron {
    color: var(--color-text-subtle);
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4) var(--space-4);
    border-top: 1px solid var(--color-border-subtle);

    :deep(.n-divider) {
      margin: var(--space-2) 0;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__field-label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-subtle);
  }

  &__weight-input {
    width: 100px;
  }

  &__bias-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__bias-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: var(--font-size-sm);
  }

  &__bias-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-subtle);
  }

  &__delete {
    display: flex;
  }

  &__delete-confirm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  &__delete-confirm-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-subtle);
  }

  &__delete-confirm-actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }
}
</style>

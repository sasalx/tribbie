<script setup lang="ts">
import type { ConfigDimension, ConfigResponse } from '~/types/kansou'
import { ChevronDownOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { api } from '~/api/client'

const props = defineProps<{ config: ConfigResponse }>()

const { t } = useI18n()
const message = useMessage()

const localDimensions = ref<Record<string, ConfigDimension>>(JSON.parse(JSON.stringify(props.config.dimensions)))
const expandedKey = ref<string | null>(null)
const confirmDeleteKey = ref<string | null>(null)
const showAddModal = ref(false)
const newDimension = reactive({ label: '', description: '', weight: 0.1 as number | null, biasResistant: false })

const weightSum = computed(() => {
  const sum = Object.values(localDimensions.value).reduce((total, dimension) => total + dimension.weight, 0)

  return { value: sum, ok: Math.abs(sum - 1) <= 0.005 }
})

const errors = computed(() => {
  const result: string[] = []
  if (weightSum.value.value > 1.005) {
    result.push(t('settings.dimensions.errorTotalExceeds'))
  }

  if (Object.keys(localDimensions.value).length === 0) {
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

function updateWeight(dimension: ConfigDimension, value: number | null) {
  if (value !== null) {
    dimension.weight = value
  }
}

function handleAddOpen() {
  Object.assign(newDimension, { label: '', description: '', weight: 0.1, biasResistant: false })
  showAddModal.value = true
}

function handleAddCancel() {
  showAddModal.value = false
}

async function handleAddConfirm() {
  const key = newDimension.label.trim().toLowerCase().replace(/\s+/g, '_')

  if (key in localDimensions.value) {
    message.error(t('settings.dimensions.addModal.errorKeyExists'))
    return
  }

  if (weightSum.value.value + newDimension.weight! > 1.005) {
    message.error(t('settings.dimensions.addModal.errorWeightExceeds'))
    return
  }

  localDimensions.value[key] = {
    label: newDimension.label.trim(),
    description: newDimension.description.trim(),
    weight: newDimension.weight!,
    bias_resistant: newDimension.biasResistant,
  }
  showAddModal.value = false

  api.post<ConfigResponse>('/v1/config', {
    ...props.config,
    dimensions: localDimensions.value,
  })
}
</script>

<template>
  <div class="dimensions-tab">
    <div class="dimensions-tab__header">
      <div class="dimensions-tab__header-left">
        <span class="dimensions-tab__title">{{ t('settings.dimensions.title') }}</span>
        <span class="dimensions-tab__subtitle">{{ t('settings.dimensions.subtitle') }}</span>
      </div>
      <div class="dimensions-tab__header-right">
        <div class="dimensions-tab__header-right-top">
          <span
            class="dimensions-tab__sum-badge"
            :class="{ 'dimensions-tab__sum-badge--ok': weightSum.ok }"
          >
            Σ {{ weightSum.value.toFixed(2) }}
          </span>
          <NButton size="small" type="primary" round @click="handleAddOpen">
            {{ t('settings.dimensions.addButton') }}
          </NButton>
        </div>
        <div v-if="errors.length > 0" class="dimensions-tab__errors">
          <span v-for="error in errors" :key="error" class="dimensions-tab__error">{{ error }}</span>
        </div>
      </div>
    </div>

    <div v-for="(dimension, index) in localDimensions" :key="index" class="dimensions-tab__card">
      <div class="dimensions-tab__card-header" @click="toggleExpand(index)">
        <div class="dimensions-tab__card-label-group">
          <span class="dimensions-tab__card-label">{{ dimension.label }}</span>
          <span class="dimensions-tab__card-weight-pill">{{ Math.round(dimension.weight * 100) }}%</span>
        </div>
        <NIcon
          size="16"
          class="dimensions-tab__chevron"
          :class="{ 'dimensions-tab__chevron--open': expandedKey === index }"
        >
          <ChevronDownOutline />
        </NIcon>
      </div>

      <template v-if="expandedKey === index">
        <div class="dimensions-tab__card-body">
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.descriptionLabel') }}</span>
            <NInput
              v-model:value="dimension.description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 2 }"
            />
          </div>
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.weightLabel') }}</span>
            <NInputNumber
              class="dimensions-tab__weight-input"
              :value="dimension.weight"
              :step="0.01"
              :min="0"
              :max="1"
              @update:value="(value) => updateWeight(dimension, value)"
            />
          </div>
          <div class="dimensions-tab__bias-row">
            <NSwitch v-model:value="dimension.bias_resistant" />
            <div class="dimensions-tab__bias-label">
              <span>{{ t('settings.dimensions.biasResistant') }}</span>
              <span class="dimensions-tab__bias-hint">{{ t('settings.dimensions.biasResistantHint') }}</span>
            </div>
          </div>
          <NDivider />
          <div v-if="confirmDeleteKey !== index" class="dimensions-tab__delete">
            <NButton text type="error" @click="handleDeleteClick(index)">
              {{ t('settings.dimensions.deleteButton') }}
            </NButton>
          </div>
          <div v-else class="dimensions-tab__delete-confirm">
            <span class="dimensions-tab__delete-confirm-text">{{ t('settings.dimensions.deleteConfirm') }}</span>
            <div class="dimensions-tab__delete-confirm-actions">
              <NButton size="small" @click="handleDeleteCancel">
                {{ t('settings.dimensions.deleteCancel') }}
              </NButton>
              <NButton size="small" type="error" @click="handleDeleteConfirm(index)">
                {{ t('settings.dimensions.deleteConfirmButton') }}
              </NButton>
            </div>
          </div>
        </div>
      </template>
    </div>

    <NModal v-model:show="showAddModal">
      <div class="dimensions-tab__modal">
        <span class="dimensions-tab__modal-title">{{ t('settings.dimensions.addModal.title') }}</span>
        <div class="dimensions-tab__modal-form">
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.addModal.labelLabel') }}</span>
            <NInput v-model:value="newDimension.label" :placeholder="t('settings.dimensions.addModal.labelPlaceholder')" />
          </div>
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.descriptionLabel') }}</span>
            <NInput v-model:value="newDimension.description" type="textarea" :autosize="{ minRows: 2, maxRows: 2 }" />
          </div>
          <div class="dimensions-tab__field">
            <span class="dimensions-tab__field-label">{{ t('settings.dimensions.weightLabel') }}</span>
            <NInputNumber
              v-model:value="newDimension.weight"
              class="dimensions-tab__weight-input"
              :step="0.01"
              :min="0"
              :max="1"
            />
          </div>
          <div class="dimensions-tab__bias-row">
            <NSwitch v-model:value="newDimension.biasResistant" />
            <div class="dimensions-tab__bias-label">
              <span>{{ t('settings.dimensions.biasResistant') }}</span>
              <span class="dimensions-tab__bias-hint">{{ t('settings.dimensions.biasResistantHint') }}</span>
            </div>
          </div>
        </div>
        <div class="dimensions-tab__modal-actions">
          <NButton @click="handleAddCancel">
            {{ t('settings.dimensions.addModal.cancel') }}
          </NButton>
          <NButton
            type="primary"
            :disabled="!newDimension.label.trim()"
            @click="handleAddConfirm"
          >
            {{ t('settings.dimensions.addModal.confirm') }}
          </NButton>
        </div>
      </div>
    </NModal>
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

  &__modal {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    padding: var(--space-6);
    width: 480px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__modal-title {
    font-size: var(--font-size-base);
    font-weight: 600;
  }

  &__modal-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }
}
</style>

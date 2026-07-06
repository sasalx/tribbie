<script setup lang="ts">
import type { WeightBreakdown } from '~/utils/weightBreakdown'
import { useI18n } from 'vue-i18n'
import { beautifyNumber } from '~/utils/stringUtils'

const props = defineProps<{
  label: string
  breakdown: WeightBreakdown
  shouldChangeColour?: boolean
  displayWeight: string
}>()

const { t } = useI18n()

const show = ref(false)

const triggerModifier = computed(() => {
  if (!props.shouldChangeColour)
    return ''
  if (props.breakdown.finalWeight > props.breakdown.baseWeight)
    return 'weight-detail__trigger--success'
  if (props.breakdown.finalWeight < props.breakdown.baseWeight)
    return 'weight-detail__trigger--danger'
  return ''
})
</script>

<template>
  <span class="weight-detail__trigger" :class="triggerModifier" @click="show = true">
    {{ props.breakdown.finalWeight === 0 ? 'N/A' : props.displayWeight }}
  </span>
  <NModal v-model:show="show" to="#app-content" preset="card" :title="`${props.label} — Weight Breakdown`" style="max-width: 600px">
    <div class="weight-detail__body">
      <div class="weight-detail__row">
        <span class="weight-detail__row-label">{{ t('weightDetail.baseDimensionWeight') }}</span>
        <span>{{ props.breakdown.baseWeight }}</span>
      </div>
      <template v-if="props.breakdown.primaryGenreMultiplier !== 0">
        <div class="weight-detail__row">
          <span class="weight-detail__row-label">{{ t('weightDetail.primaryGenreWeight') }}</span>
          <span>{{ beautifyNumber(props.breakdown.primaryGenreWeight) }}</span>
        </div>
        <div class="weight-detail__row">
          <span class="weight-detail__row-label">{{ t('weightDetail.primaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.breakdown.primaryGenreMultiplier) }}</span>
        </div>
        <div v-if="props.breakdown.secondaryGenresMultiplier !== 0" class="weight-detail__row">
          <span class="weight-detail__row-label">{{ t('weightDetail.secondaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.breakdown.secondaryGenresMultiplier) }}</span>
        </div>
      </template>
      <div class="weight-detail__row">
        <span class="weight-detail__row-label weight-detail__row-label--stacked">
          <span>{{ t('weightDetail.genreMultiplier') }}</span>
          <span v-if="props.breakdown.primaryGenreMultiplier === 0" class="weight-detail__row-sub">
            {{ t('weightDetail.genreMultiplierRaw') }}
          </span>
          <span v-else-if="props.breakdown.secondaryGenresMultiplier === 0" class="weight-detail__row-sub">
            {{ t('weightDetail.genreMultiplierPrimaryOnly') }}
          </span>
          <span v-else class="weight-detail__row-sub">
            <span>{{ t('weightDetail.genreMultiplierBlendedLine1') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine2') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine3') }}</span>
          </span>
        </span>
        <span>× {{ beautifyNumber(props.breakdown.multiplier) }}</span>
      </div>
      <div class="weight-detail__row">
        <span class="weight-detail__row-label weight-detail__row-label--stacked">
          <span>{{ t('weightDetail.effectiveWeight') }}</span>
          <span class="weight-detail__row-sub">{{ t('weightDetail.effectiveWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.effectiveWeight) }}</span>
      </div>
      <div class="weight-detail__row">
        <span class="weight-detail__row-label weight-detail__row-label--stacked">
          <span>{{ t('weightDetail.effectiveWeightSum') }}</span>
          <span class="weight-detail__row-sub">{{ t('weightDetail.effectiveWeightSumDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.effectiveWeightSum) }}</span>
      </div>
      <NDivider />
      <div class="weight-detail__row weight-detail__row--footer">
        <span class="weight-detail__row-label--stacked">
          <span>{{ t('weightDetail.finalWeight') }}</span>
          <span class="weight-detail__row-sub weight-detail__row-sub--normal">{{ t('weightDetail.finalWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.finalWeight) }}</span>
      </div>
    </div>
  </NModal>
</template>

<style lang="scss" scoped>
.weight-detail {
  &__trigger {
    position: relative;
    z-index: var(--z-above);
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dashed;
    text-underline-offset: 2px;

    &--success {
      color: var(--color-success);
    }

    &--danger {
      color: var(--color-danger);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
  }

  &__row {
    display: flex;
    justify-content: space-between;

    &--footer {
      font-weight: 600;
    }
  }

  &__row-label {
    font-weight: 600;
    color: var(--color-text-muted);

    &--stacked {
      display: flex;
      flex-direction: column;
      color: var(--color-text-muted);
    }
  }

  &__row-sub {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-xs);

    &--normal {
      font-weight: 400;
      color: var(--color-text-muted);
    }
  }
}
</style>

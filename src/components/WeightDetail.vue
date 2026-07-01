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

const compareColorClass = computed(() => {
  if (!props.shouldChangeColour) {
    return ''
  }
  if (props.breakdown.finalWeight > props.breakdown.baseWeight) {
    return 'text-green-500'
  }
  if (props.breakdown.finalWeight < props.breakdown.baseWeight) {
    return 'text-red-500'
  }
  return ''
})
</script>

<template>
  <span class="relative z-1 cursor-pointer underline decoration-dashed underline-offset-2" :class="compareColorClass" @click="show = true">
    {{ props.breakdown.finalWeight === 0 ? 'N/A' : props.displayWeight }}
  </span>
  <NModal v-model:show="show" to="#app-content" preset="card" :title="`${props.label} — Weight Breakdown`" style="max-width: 600px">
    <div class="flex flex-col gap-3 text-sm">
      <div class="flex justify-between">
        <span class="font-semibold opacity-60">{{ t('weightDetail.baseDimensionWeight') }}</span>
        <span>{{ props.breakdown.baseWeight }}</span>
      </div>
      <template v-if="props.breakdown.primaryGenreMultiplier !== 0">
        <div class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.primaryGenreWeight') }}</span>
          <span>{{ beautifyNumber(props.breakdown.primaryGenreWeight) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.primaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.breakdown.primaryGenreMultiplier) }}</span>
        </div>
        <div v-if="props.breakdown.secondaryGenresMultiplier !== 0" class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.secondaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.breakdown.secondaryGenresMultiplier) }}</span>
        </div>
      </template>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.genreMultiplier') }}</span>
          <span v-if="props.breakdown.primaryGenreMultiplier === 0" class="text-xs">
            {{ t('weightDetail.genreMultiplierRaw') }}
          </span>
          <span v-else-if="props.breakdown.secondaryGenresMultiplier === 0" class="text-xs">
            {{ t('weightDetail.genreMultiplierPrimaryOnly') }}
          </span>
          <span v-else class="flex flex-col text-xs">
            <span>{{ t('weightDetail.genreMultiplierBlendedLine1') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine2') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine3') }}</span>
          </span>
        </span>
        <span>× {{ beautifyNumber(props.breakdown.multiplier) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.effectiveWeight') }}</span>
          <span class="text-xs">{{ t('weightDetail.effectiveWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.effectiveWeight) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.effectiveWeightSum') }}</span>
          <span class="text-xs">{{ t('weightDetail.effectiveWeightSumDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.effectiveWeightSum) }}</span>
      </div>
      <NDivider />
      <div class="flex justify-between font-semibold">
        <span class="flex flex-col">
          <span>{{ t('weightDetail.finalWeight') }}</span>
          <span class="text-xs font-normal opacity-60">{{ t('weightDetail.finalWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.breakdown.finalWeight) }}</span>
      </div>
    </div>
  </NModal>
</template>

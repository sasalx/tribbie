<script setup lang="ts">
import { beautifyNumber, decimalToPercentage } from '~/utils/stringUtils'

const props = defineProps<{
  label: string
  baseWeight: number
  appliedMultiplier: number
  finalWeight: number
  effectiveWeightSum: number
  primaryGenreWeight: number
  primaryGenreMultiplier: number
  secondaryGenresMultiplier: number
}>()

const { t } = useI18n()

const show = ref(false)

const blendedMultiplier = computed(() => {
  const primaryGenreMultiplier = props.primaryGenreMultiplier
  const secondaryGenresMultiplier = props.secondaryGenresMultiplier
  const primaryGenreWeight = props.primaryGenreWeight

  if (primaryGenreMultiplier === 0) {
    return props.appliedMultiplier
  }
  if (secondaryGenresMultiplier === 0) {
    return primaryGenreMultiplier
  }

  return ((primaryGenreMultiplier * primaryGenreWeight) + (secondaryGenresMultiplier * (1 - primaryGenreWeight)))
})
const effectiveWeight = computed(() => props.baseWeight * blendedMultiplier.value)
const calculatedFinalWeight = computed(() => effectiveWeight.value / props.effectiveWeightSum)
</script>

<template>
  <span class="cursor-pointer underline decoration-dashed underline-offset-2" @click="show = true">
    {{ decimalToPercentage(props.finalWeight) }}
  </span>
  <NModal v-model:show="show" preset="card" :title="`${props.label} — Weight Breakdown`" style="max-width: 600px">
    <div class="flex flex-col gap-3 text-sm">
      <div class="flex justify-between">
        <span class="font-semibold opacity-60">{{ t('weightDetail.baseDimensionWeight') }}</span>
        <span>{{ props.baseWeight }}</span>
      </div>
      <template v-if="props.primaryGenreMultiplier !== 0">
        <div class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.primaryGenreWeight') }}</span>
          <span>{{ beautifyNumber(props.primaryGenreWeight) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.primaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.primaryGenreMultiplier) }}</span>
        </div>
        <div v-if="props.secondaryGenresMultiplier !== 0" class="flex justify-between">
          <span class="font-semibold opacity-60">{{ t('weightDetail.secondaryGenreMultiplier') }}</span>
          <span>{{ beautifyNumber(props.secondaryGenresMultiplier) }}</span>
        </div>
      </template>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.genreMultiplier') }}</span>
          <span v-if="props.primaryGenreMultiplier === 0" class="text-xs">
            {{ t('weightDetail.genreMultiplierRaw') }}
          </span>
          <span v-else-if="props.secondaryGenresMultiplier === 0" class="text-xs">
            {{ t('weightDetail.genreMultiplierPrimaryOnly') }}
          </span>
          <span v-else class="flex flex-col text-xs">
            <span>{{ t('weightDetail.genreMultiplierBlendedLine1') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine2') }}</span>
            <span>{{ t('weightDetail.genreMultiplierBlendedLine3') }}</span>
          </span>
        </span>
        <span>× {{ beautifyNumber(blendedMultiplier) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.effectiveWeight') }}</span>
          <span class="text-xs">{{ t('weightDetail.effectiveWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(effectiveWeight) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span class="font-semibold">{{ t('weightDetail.effectiveWeightSum') }}</span>
          <span class="text-xs">{{ t('weightDetail.effectiveWeightSumDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(props.effectiveWeightSum) }}</span>
      </div>
      <NDivider />
      <div class="flex justify-between font-semibold">
        <span class="flex flex-col">
          <span>{{ t('weightDetail.finalWeight') }}</span>
          <span class="text-xs font-normal opacity-60">{{ t('weightDetail.finalWeightDesc') }}</span>
        </span>
        <span>{{ beautifyNumber(calculatedFinalWeight) }}</span>
      </div>
    </div>
  </NModal>
</template>

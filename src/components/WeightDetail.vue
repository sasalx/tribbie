<script setup lang="ts">
import { beautifyNumber, decimalToPercentage } from '~/utils/stringUtils'

const props = defineProps<{
  label: string
  baseWeight: number
  appliedMultiplier: number
  finalWeight: number
  effectiveWeightSum: number
}>()

const show = ref(false)
const effectiveWeight = computed(() => props.baseWeight * props.appliedMultiplier)
const calculatedFinalWeight = computed(() => effectiveWeight.value / props.effectiveWeightSum)
</script>

<template>
  <span class="cursor-pointer underline decoration-dashed underline-offset-2" @click="show = true">
    {{ decimalToPercentage(props.finalWeight) }}
  </span>
  <NModal v-model:show="show" preset="card" :title="`${props.label} — Weight Breakdown`" style="max-width: 600px">
    <div class="flex flex-col gap-3 text-sm">
      <div class="flex justify-between">
        <span class="opacity-60">Base Dimension Weight</span>
        <span>{{ props.baseWeight }}</span>
      </div>
      <div class="flex justify-between">
        <span class="opacity-60">Genre Multiplier</span>
        <span>× {{ beautifyNumber(props.appliedMultiplier) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span>Effective Weight</span>
          <span class="text-xs">(Base Dimension Weight × Genre Multiplier)</span>
        </span>
        <span>{{ beautifyNumber(effectiveWeight) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="flex flex-col opacity-60">
          <span>Effective Weight Sum</span>
          <span class="text-xs">(Sum of Effective Weights of All Dimensions)</span>
        </span>
        <span>{{ props.effectiveWeightSum }}</span>
      </div>
      <NDivider />
      <div class="flex justify-between font-semibold">
        <span class="flex flex-col">
          <span>Final Weight</span>
          <span class="text-xs font-normal opacity-60">(Effective Weight ÷ Effective Weight Sum)</span>
        </span>
        <span>{{ calculatedFinalWeight.toFixed(3) }}</span>
      </div>
    </div>
  </NModal>
</template>

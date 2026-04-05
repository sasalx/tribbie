<script setup lang="ts">
import type { DimensionsResponse } from '~/types/kansou'
import { api } from '~/api/client'

// const routeParamID = useRoute('/rate/[id]').params
const dimensions = ref<DimensionsResponse | null>(null)
const values = ref<Record<string, number | null>>({})

onMounted(async () => {
  dimensions.value = await api.get<DimensionsResponse>('/dimensions')
  values.value = Object.fromEntries(
    dimensions.value.dimensions.map(d => [d.key, null]),
  )
})

async function handleSubmit() {
}
</script>

<template>
  <NForm label-placement="top" class="max-w-400px">
    <NFormItem
      v-for="dimension in dimensions?.dimensions"
      :key="dimension.key"
      :label="dimension.label"
    >
      <div class="flex flex-col gap-1 w-full">
        <span class="text-xs opacity-60 pl-0.5">{{ dimension.description }}</span>
        <NInputNumber
          v-model:value="values[dimension.key]"
          class="w-full"
          :min="0"
          :max="10"
          :step="0.5"
          placeholder="Enter a value"
        />
      </div>
    </NFormItem>
    <NButton type="primary" block @click="handleSubmit">
      Submit
    </NButton>
  </NForm>
</template>

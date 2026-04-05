<script setup lang="ts">
const valueA = ref<number | null>(null)
const valueB = ref<number | null>(null)

function handleSubmit() {
  // TODO
}
</script>

<template>
  <NForm label-placement="top" class="max-w-400px">
    <NFormItem label="Value A">
      <NInputNumber
        v-model:value="valueA"
        class="w-full"
        :min="0"
        :max="10"
        :step="0.5"
        placeholder="Enter a value"
      />
    </NFormItem>
    <NFormItem label="Value B">
      <NInputNumber
        v-model:value="valueB"
        class="w-full"
        :min="0"
        :max="10"
        :step="0.5"
        placeholder="Enter a value"
      />
    </NFormItem>
    <NButton type="primary" block @click="handleSubmit">
      Submit
    </NButton>
  </NForm>
</template>

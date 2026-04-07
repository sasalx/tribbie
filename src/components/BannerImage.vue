<script setup lang="ts">
defineProps<{
  src?: string
}>()
</script>

<template>
  <div class="w-full h-48 overflow-hidden">
    <NImage
      :src="src"
      preview-disabled
      width="100%"
      height="192"
      object-fit="cover"
      class="w-full"
    />
  </div>
</template>

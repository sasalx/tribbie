<script setup lang="ts">
defineProps<{
  src?: string
}>()
</script>

<template>
  <div class="banner-image">
    <NImage
      :src="src"
      preview-disabled
      width="100%"
      height="192"
      object-fit="cover"
      class="banner-image__img"
    />
  </div>
</template>

<style lang="scss" scoped>
.banner-image {
  width: 100%;
  height: 192px;
  overflow: hidden;

  &__img {
    width: 100%;
  }
}
</style>

<script setup lang="ts">
</script>

<template>
  <div class="flex items-center justify-center h-full gap-16">
    <img src="/tribbie-home.jpg" alt="Tribbie" class="max-h-[70vh] object-contain rounded-xl">

    <div class="flex flex-col gap-4">
      <div v-for="word in ['Search', 'Score', 'Ship it']" :key="word" class="text-5xl font-bold">
        <span class="gradient-text">{{ word }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  display: inline-block;
  background: linear-gradient(90deg, #63e2b7, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text::first-letter {
  font-size: 1.5em;
}
</style>

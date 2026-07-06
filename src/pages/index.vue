<script setup lang="ts">
const { tm } = useI18n()
const taglines = computed(() => tm('home.taglines') as string[])
</script>

<template>
  <div class="home">
    <img src="/tribbie-home.jpg" alt="Tribbie" class="home__image">
    <div class="home__taglines">
      <div v-for="word in taglines" :key="word" class="home__tagline">
        <span class="home__tagline-text">{{ word }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-16);

  &__image {
    max-height: 70vh;
    object-fit: contain;
    border-radius: var(--radius-lg);
  }

  &__taglines {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__tagline {
    font-size: var(--font-size-5xl);
    font-weight: 700;
  }

  &__tagline-text {
    display: inline-block;
    background: linear-gradient(90deg, var(--color-brand), var(--color-brand-alt));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    &::first-letter {
      font-size: 1.5em;
    }
  }
}
</style>

<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="settings">
    <NCard :title="t('settings.title')" bordered>
      <span class="settings__empty">{{ t('settings.empty') }}</span>
    </NCard>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--layout-padding);

  &__empty {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
}
</style>

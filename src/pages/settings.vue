<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <NCard :title="t('settings.title')" bordered>
      <span class="text-sm opacity-60">{{ t('settings.empty') }}</span>
    </NCard>
  </div>
</template>

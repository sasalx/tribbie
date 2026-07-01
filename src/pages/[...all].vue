<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <NResult status="404" :title="t('notFound')" :description="t('notFoundDesc')">
      <template #footer>
        <NButton @click="router.push('/')">
          {{ t('notFoundButton') }}
        </NButton>
      </template>
    </NResult>
  </div>
</template>

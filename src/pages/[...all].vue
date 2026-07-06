<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <NResult status="404" :title="t('notFound')" :description="t('notFoundDesc')">
      <template #footer>
        <NButton @click="router.push('/')">
          {{ t('notFoundButton') }}
        </NButton>
      </template>
    </NResult>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>

<script setup lang="ts">
import type { ConfigResponse } from '~/types/kansou'

defineProps<{ config: ConfigResponse }>()
</script>

<template>
  <div class="genres-tab" />
</template>

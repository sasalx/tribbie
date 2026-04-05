<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { darkTheme } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const menuOptions: MenuOption[] = [
  {
    label: 'Home',
    key: '/',
  },
  {
    label: 'Search',
    key: '/search',
  },
]

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NLayout has-sider class="h-screen">
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="200"
        show-trigger
      >
        <NMenu
          :value="route.path"
          :options="menuOptions"
          :collapsed-width="64"
          @update:value="handleMenuSelect"
        />
      </NLayoutSider>

      <NLayoutContent content-style="padding: 24px; height: 100%">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

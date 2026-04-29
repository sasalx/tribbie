<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { HomeOutline, SearchOutline, TimeOutline } from '@vicons/ionicons5'
import { darkTheme, NIcon } from 'naive-ui'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const menuOptions: MenuOption[] = [
  {
    label: 'Home',
    key: '/',
    icon: renderIcon(HomeOutline),
  },
  {
    label: 'Search',
    key: '/search',
    icon: renderIcon(SearchOutline),
  },
  {
    label: 'History',
    key: '/history',
    icon: renderIcon(TimeOutline),
  },
]

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NNotificationProvider>
      <NLayout has-sider class="h-screen">
        <NLayoutSider
          v-model:collapsed="collapsed"
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="220"
          show-trigger
        >
          <div class="flex items-center gap-2 px-3 py-2 overflow-hidden">
            <img
              src="/tribbie.png"
              alt="Tribbie"
              class="w-10 h-10 rounded-full object-cover shrink-0"
            >
            <Transition name="title-fade">
              <span v-if="!collapsed" class="text-sm font-semibold truncate tribbie-title">
                Tribbie's Scorekeeper
              </span>
            </Transition>
          </div>
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
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style scoped>
.tribbie-title {
  background: linear-gradient(90deg, #63e2b7, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-fade-enter-active,
.title-fade-leave-active {
  transition: opacity 0.2s ease;
}

.title-fade-enter-from,
.title-fade-leave-to {
  opacity: 0;
}
</style>

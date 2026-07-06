<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { HomeOutline, SearchOutline, SettingsOutline, TimeOutline } from '@vicons/ionicons5'
import { darkTheme, NIcon } from 'naive-ui'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const router = useRouter()
const route = useRoute()
const collapsed = ref(true)

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
  {
    label: 'Settings',
    key: '/settings',
    icon: renderIcon(SettingsOutline),
  },
]

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NNotificationProvider>
      <NLayout class="app-layout" has-sider>
        <NLayoutSider
          v-model:collapsed="collapsed"
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="220"
          show-trigger
        >
          <div class="app-sidebar__header">
            <img
              src="/tribbie.png"
              alt="Tribbie"
              class="app-sidebar__logo"
            >
            <Transition name="title-fade">
              <span v-if="!collapsed" class="app-sidebar__title tribbie-title">
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

        <NLayoutContent id="app-content" class="contain-layout" content-class="app-layout__content">
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
}

.app-sidebar {
  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    overflow: hidden;
  }

  &__logo {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    object-fit: cover;
    flex-shrink: 0;
  }

  &__title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

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

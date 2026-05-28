<template>
  <div class="dark-mode-switcher">
    <Button
      :icon="currentTheme.icon"
      :label="props.showLabel ? currentTheme.label : undefined"
      @click="toggleThemeMenu"
      severity="secondary"
      outlined
      size="small"
      v-tooltip.bottom="`Theme: ${currentTheme.label}`"
      aria-haspopup="true"
      :aria-controls="menuId"
      :aria-label="`Theme mode: ${currentTheme.label}`"
    />
    <Menu ref="themeMenu" :id="menuId" :model="themeMenuItems" popup />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useThemeMode } from '@/composables/useThemeMode'

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
})

const { themeMode, setThemeMode, themeModes } = useThemeMode()
const themeMenu = ref()
const menuId = `theme-mode-menu-${Math.random().toString(36).slice(2, 10)}`

const themeDefinitions = {
  [themeModes.LIGHT]: {
    label: 'Light',
    icon: 'pi pi-sun'
  },
  [themeModes.DARK]: {
    label: 'Dark',
    icon: 'pi pi-moon'
  },
  [themeModes.SYSTEM]: {
    label: 'System',
    icon: 'pi pi-desktop'
  }
}

const currentTheme = computed(() => themeDefinitions[themeMode.value] || themeDefinitions[themeModes.SYSTEM])

const createThemeMenuItem = (mode, label, icon) => ({
  label: themeMode.value === mode ? `${label} (Current)` : label,
  icon,
  command: () => setThemeMode(mode)
})

const themeMenuItems = computed(() => [
  createThemeMenuItem(themeModes.LIGHT, 'Light', 'pi pi-sun'),
  createThemeMenuItem(themeModes.DARK, 'Dark', 'pi pi-moon'),
  createThemeMenuItem(themeModes.SYSTEM, 'System', 'pi pi-desktop')
])

const toggleThemeMenu = (event) => {
  themeMenu.value?.toggle(event)
}
</script>

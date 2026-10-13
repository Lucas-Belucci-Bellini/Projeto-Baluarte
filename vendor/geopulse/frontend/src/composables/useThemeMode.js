import { computed, ref } from 'vue'
import {
  THEME_MODES,
  getThemeMode,
  initializeThemeMode,
  resolveThemeModeToDark,
  setThemeMode as persistThemeMode
} from '@/utils/themeMode'

initializeThemeMode()

const themeModeState = ref(getThemeMode())

const setThemeMode = (themeMode) => {
  themeModeState.value = persistThemeMode(themeMode)
}

const themeMode = computed({
  get: () => themeModeState.value,
  set: (nextThemeMode) => setThemeMode(nextThemeMode)
})

const isDarkMode = computed(() => resolveThemeModeToDark(themeModeState.value))

export function useThemeMode() {
  return {
    themeMode,
    isDarkMode,
    setThemeMode,
    themeModes: THEME_MODES
  }
}

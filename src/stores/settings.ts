import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type FontSize = 'small' | 'medium' | 'large'

const FONT_SIZE_KEY = 'ai-chat-font-size'

const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px'
}

export const useSettingsStore = defineStore('settings', () => {
  const savedSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null
  const fontSize = ref<FontSize>(savedSize || 'medium')

  function setFontSize(size: FontSize): void {
    fontSize.value = size
    applyFontSize(size)
  }

  function applyFontSize(size: FontSize): void {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[size]
  }

  watch(fontSize, (newSize) => {
    localStorage.setItem(FONT_SIZE_KEY, newSize)
  })

  if (savedSize) {
    applyFontSize(savedSize)
  }

  return {
    fontSize,
    setFontSize
  }
})

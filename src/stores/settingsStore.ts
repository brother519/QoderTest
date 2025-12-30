import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const musicVolume = ref(0.5)
  const sfxVolume = ref(0.7)
  const musicEnabled = ref(true)
  const sfxEnabled = ref(true)
  const animationSpeed = ref<'slow' | 'normal' | 'fast'>('normal')
  
  function setMusicVolume(volume: number) {
    musicVolume.value = Math.max(0, Math.min(1, volume))
    saveSettings()
  }
  
  function setSfxVolume(volume: number) {
    sfxVolume.value = Math.max(0, Math.min(1, volume))
    saveSettings()
  }
  
  function toggleMusic() {
    musicEnabled.value = !musicEnabled.value
    saveSettings()
  }
  
  function toggleSfx() {
    sfxEnabled.value = !sfxEnabled.value
    saveSettings()
  }
  
  function setAnimationSpeed(speed: 'slow' | 'normal' | 'fast') {
    animationSpeed.value = speed
    saveSettings()
  }
  
  function saveSettings() {
    localStorage.setItem('match3_settings', JSON.stringify({
      musicVolume: musicVolume.value,
      sfxVolume: sfxVolume.value,
      musicEnabled: musicEnabled.value,
      sfxEnabled: sfxEnabled.value,
      animationSpeed: animationSpeed.value
    }))
  }
  
  function loadSettings() {
    const saved = localStorage.getItem('match3_settings')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        musicVolume.value = data.musicVolume ?? 0.5
        sfxVolume.value = data.sfxVolume ?? 0.7
        musicEnabled.value = data.musicEnabled ?? true
        sfxEnabled.value = data.sfxEnabled ?? true
        animationSpeed.value = data.animationSpeed ?? 'normal'
      } catch {
        // Use defaults
      }
    }
  }
  
  loadSettings()
  
  return {
    musicVolume,
    sfxVolume,
    musicEnabled,
    sfxEnabled,
    animationSpeed,
    setMusicVolume,
    setSfxVolume,
    toggleMusic,
    toggleSfx,
    setAnimationSpeed
  }
})

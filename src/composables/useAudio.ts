import { ref } from 'vue'
import { useSettingsStore } from '@/stores'

const audioContext = ref<AudioContext | null>(null)

export function useAudio() {
  const settings = useSettingsStore()
  
  function initAudio() {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }
  }
  
  function playTone(frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') {
    if (!settings.sfxEnabled) return
    
    initAudio()
    const ctx = audioContext.value!
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gainNode.gain.setValueAtTime(settings.sfxVolume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }
  
  function playMatch(combo: number = 0) {
    const baseFreq = 523.25
    const freq = baseFreq * Math.pow(1.059463, combo * 2)
    playTone(Math.min(freq, 1046.5), 0.15, 'triangle')
  }
  
  function playSwap() {
    playTone(392, 0.08, 'sine')
  }
  
  function playInvalidMove() {
    playTone(200, 0.2, 'sawtooth')
  }
  
  function playSpecial() {
    playTone(659.25, 0.1, 'triangle')
    setTimeout(() => playTone(783.99, 0.1, 'triangle'), 100)
    setTimeout(() => playTone(987.77, 0.15, 'triangle'), 200)
  }
  
  function playLevelComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle'), i * 150)
    })
  }
  
  function playGameOver() {
    playTone(392, 0.3, 'sawtooth')
    setTimeout(() => playTone(349.23, 0.3, 'sawtooth'), 300)
    setTimeout(() => playTone(293.66, 0.5, 'sawtooth'), 600)
  }
  
  return {
    playMatch,
    playSwap,
    playInvalidMove,
    playSpecial,
    playLevelComplete,
    playGameOver
  }
}

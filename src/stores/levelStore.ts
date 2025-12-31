import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LEVELS } from '@/constants/levels'
import type { LevelConfig } from '@/types'

export const useLevelStore = defineStore('level', () => {
  const unlockedLevels = ref<number[]>([1])
  const levelStars = ref<Record<number, number>>({})
  
  const levels = computed(() => LEVELS)
  
  function isLevelUnlocked(levelId: number): boolean {
    return unlockedLevels.value.includes(levelId)
  }
  
  function getLevelStars(levelId: number): number {
    return levelStars.value[levelId] || 0
  }
  
  function unlockLevel(levelId: number) {
    if (!unlockedLevels.value.includes(levelId)) {
      unlockedLevels.value.push(levelId)
      saveProgress()
    }
  }
  
  function setLevelStars(levelId: number, stars: number) {
    if (!levelStars.value[levelId] || levelStars.value[levelId] < stars) {
      levelStars.value[levelId] = stars
      saveProgress()
    }
  }
  
  function completeLevel(levelId: number, score: number) {
    const level = LEVELS.find(l => l.id === levelId)
    if (!level) return
    
    let stars = 0
    if (score >= level.starThresholds[2]) stars = 3
    else if (score >= level.starThresholds[1]) stars = 2
    else if (score >= level.starThresholds[0]) stars = 1
    
    setLevelStars(levelId, stars)
    
    const nextLevelId = levelId + 1
    if (LEVELS.find(l => l.id === nextLevelId)) {
      unlockLevel(nextLevelId)
    }
  }
  
  function saveProgress() {
    localStorage.setItem('match3_progress', JSON.stringify({
      unlockedLevels: unlockedLevels.value,
      levelStars: levelStars.value
    }))
  }
  
  function loadProgress() {
    const saved = localStorage.getItem('match3_progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        unlockedLevels.value = data.unlockedLevels || [1]
        levelStars.value = data.levelStars || {}
      } catch {
        unlockedLevels.value = [1]
        levelStars.value = {}
      }
    }
  }
  
  loadProgress()
  
  return {
    levels,
    unlockedLevels,
    levelStars,
    isLevelUnlocked,
    getLevelStars,
    unlockLevel,
    setLevelStars,
    completeLevel,
    loadProgress
  }
})

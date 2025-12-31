<template>
  <div class="level-select-view">
    <LevelSelector @select="handleSelect" @back="handleBack" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores'
import LevelSelector from '@/components/level/LevelSelector.vue'

const router = useRouter()
const gameStore = useGameStore()

function handleSelect(levelId: number) {
  gameStore.initGame(levelId)
  router.push('/game')
}

function handleBack() {
  router.push('/')
}
</script>

<style scoped>
.level-select-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

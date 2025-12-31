<template>
  <div class="game-view">
    <GameHeader />
    <GameBoard />
    
    <div class="game-controls">
      <button class="control-btn" @click="handlePause">
        暂停
      </button>
      <button class="control-btn" @click="handleRestart">
        重开
      </button>
    </div>
    
    <Modal :show="isPaused" @close="handleResume">
      <div class="pause-menu">
        <h2>游戏暂停</h2>
        <div class="pause-buttons">
          <button class="btn btn-primary" @click="handleResume">继续游戏</button>
          <button class="btn btn-secondary" @click="handleRestart">重新开始</button>
          <button class="btn btn-secondary" @click="handleMenu">返回菜单</button>
        </div>
      </div>
    </Modal>
    
    <LevelComplete
      :show="showResult"
      :score="gameStore.score"
      :level="gameStore.currentLevel"
      :is-game-over="gameStore.isGameOver"
      @restart="handleRestart"
      @next="handleNext"
      @menu="handleMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore, useLevelStore } from '@/stores'
import GameHeader from '@/components/game/GameHeader.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import Modal from '@/components/common/Modal.vue'
import LevelComplete from '@/components/level/LevelComplete.vue'
import { GameState } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const levelStore = useLevelStore()

const isPaused = computed(() => gameStore.state === GameState.PAUSED)
const showResult = computed(() => gameStore.isGameOver || gameStore.isLevelComplete)

onMounted(() => {
  if (gameStore.state === GameState.IDLE) {
    gameStore.initGame(1)
  }
})

watch(() => gameStore.isLevelComplete, (complete) => {
  if (complete) {
    levelStore.completeLevel(gameStore.currentLevel, gameStore.score)
  }
})

function handlePause() {
  gameStore.pauseGame()
}

function handleResume() {
  gameStore.resumeGame()
}

function handleRestart() {
  gameStore.restartLevel()
}

function handleNext() {
  gameStore.nextLevel()
}

function handleMenu() {
  router.push('/')
}
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.game-controls {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.control-btn {
  padding: 10px 25px;
  background: linear-gradient(145deg, #34495e, #2c3e50);
  color: #ecf0f1;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: translateY(-2px);
}

.pause-menu {
  text-align: center;
  color: #ecf0f1;
}

.pause-menu h2 {
  margin-bottom: 25px;
  font-size: 28px;
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 14px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}
</style>

<template>
  <div class="main-menu">
    <h1 class="title">消消乐</h1>
    <div class="menu-buttons">
      <button class="menu-btn primary" @click="$router.push('/game')">
        开始游戏
      </button>
      <button class="menu-btn" @click="$router.push('/levels')">
        选择关卡
      </button>
      <button class="menu-btn" @click="showModeSelector = true">
        游戏模式
      </button>
    </div>
    
    <Modal :show="showModeSelector" @close="showModeSelector = false">
      <div class="mode-selector">
        <h3>选择模式</h3>
        <div class="modes">
          <div class="mode-card" @click="startGame('classic')">
            <div class="mode-icon">🎯</div>
            <div class="mode-name">经典模式</div>
            <div class="mode-desc">步数限制，完成目标</div>
          </div>
          <div class="mode-card" @click="startGame('timed')">
            <div class="mode-icon">⏱️</div>
            <div class="mode-name">限时挑战</div>
            <div class="mode-desc">60秒内获取最高分</div>
          </div>
          <div class="mode-card" @click="startGame('endless')">
            <div class="mode-icon">♾️</div>
            <div class="mode-name">无限模式</div>
            <div class="mode-desc">轻松游玩，无限制</div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/common/Modal.vue'
import { useGameStore } from '@/stores'
import { GameMode } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const showModeSelector = ref(false)

function startGame(mode: string) {
  const gameMode = mode === 'timed' ? GameMode.TIMED : mode === 'endless' ? GameMode.ENDLESS : GameMode.CLASSIC
  gameStore.initGame(1, gameMode)
  showModeSelector.value = false
  router.push('/game')
}
</script>

<style scoped>
.main-menu {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.title {
  font-size: 64px;
  font-weight: bold;
  background: linear-gradient(135deg, #e74c3c, #f1c40f, #2ecc71, #3498db, #9b59b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 50px;
  text-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: title-glow 3s ease-in-out infinite;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-btn {
  padding: 16px 60px;
  font-size: 20px;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: linear-gradient(145deg, #34495e, #2c3e50);
  color: #ecf0f1;
}

.menu-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.menu-btn.primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 5px 20px rgba(52, 152, 219, 0.4);
}

.mode-selector {
  text-align: center;
  color: #ecf0f1;
}

.mode-selector h3 {
  font-size: 24px;
  margin-bottom: 25px;
}

.modes {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.mode-card {
  background: linear-gradient(145deg, #34495e, #2c3e50);
  border-radius: 12px;
  padding: 25px 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 140px;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.mode-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.mode-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.mode-desc {
  font-size: 12px;
  color: #95a5a6;
}

@keyframes title-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
</style>

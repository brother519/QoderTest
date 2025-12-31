<template>
  <div class="game-header">
    <div class="header-item">
      <span class="label">关卡</span>
      <span class="value">{{ gameStore.currentLevel }}</span>
    </div>
    <div class="header-item score">
      <span class="label">分数</span>
      <span class="value">{{ gameStore.score }}</span>
      <span class="target">/ {{ gameStore.targetScore }}</span>
    </div>
    <div class="header-item">
      <span class="label">步数</span>
      <span class="value" :class="{ warning: gameStore.movesLeft <= 5 }">
        {{ gameStore.movesLeft }}
      </span>
    </div>
    <div v-if="gameStore.combo > 0" class="combo-display">
      <span>{{ gameStore.combo }}x 连击!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores'

const gameStore = useGameStore()
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(145deg, #1a252f, #2c3e50);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

.header-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.label {
  font-size: 12px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #ecf0f1;
}

.value.warning {
  color: #e74c3c;
  animation: pulse 0.5s infinite;
}

.target {
  font-size: 14px;
  color: #7f8c8d;
}

.score {
  flex-direction: row;
  gap: 8px;
  align-items: baseline;
}

.score .label {
  margin-right: 5px;
}

.combo-display {
  position: absolute;
  top: -10px;
  right: 20px;
  background: linear-gradient(135deg, #f39c12, #e74c3c);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  animation: bounce 0.3s ease;
  box-shadow: 0 2px 10px rgba(243, 156, 18, 0.5);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bounce {
  0% { transform: scale(0.5); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>

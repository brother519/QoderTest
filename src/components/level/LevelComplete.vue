<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="level-complete">
      <h2>{{ isGameOver ? '游戏结束' : '恭喜通关!' }}</h2>
      
      <div class="stars" v-if="!isGameOver">
        <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= stars }">
          ★
        </span>
      </div>
      
      <div class="score-display">
        <span class="label">最终得分</span>
        <span class="score">{{ score }}</span>
      </div>
      
      <div class="actions">
        <button class="btn btn-secondary" @click="$emit('restart')">
          重新开始
        </button>
        <button v-if="!isGameOver" class="btn btn-primary" @click="$emit('next')">
          下一关
        </button>
        <button class="btn btn-secondary" @click="$emit('menu')">
          返回菜单
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'
import { computed } from 'vue'
import { LEVELS } from '@/constants/levels'

const props = defineProps<{
  show: boolean
  score: number
  level: number
  isGameOver: boolean
}>()

defineEmits<{
  close: []
  restart: []
  next: []
  menu: []
}>()

const stars = computed(() => {
  const levelConfig = LEVELS.find(l => l.id === props.level)
  if (!levelConfig) return 0
  
  const thresholds = levelConfig.starThresholds
  if (props.score >= thresholds[2]) return 3
  if (props.score >= thresholds[1]) return 2
  if (props.score >= thresholds[0]) return 1
  return 0
})
</script>

<style scoped>
.level-complete {
  text-align: center;
  color: #ecf0f1;
}

h2 {
  font-size: 28px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f39c12, #e74c3c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stars {
  font-size: 40px;
  margin-bottom: 20px;
}

.star {
  color: #34495e;
  margin: 0 5px;
  transition: color 0.3s, transform 0.3s;
}

.star.active {
  color: #f1c40f;
  animation: star-pop 0.5s ease;
}

.score-display {
  margin-bottom: 25px;
}

.score-display .label {
  display: block;
  font-size: 14px;
  color: #95a5a6;
  margin-bottom: 5px;
}

.score-display .score {
  font-size: 36px;
  font-weight: bold;
  color: #3498db;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

@keyframes star-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
